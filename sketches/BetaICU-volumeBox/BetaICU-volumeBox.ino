#include <OpenWiFi.h>

#include <ESP8266HTTPClient.h>
#include <Servo.h>
#include <ESP8266WiFi.h>
#include <WiFiManager.h>

#include "SpringyValue.h"
#include "config.h"
#include "WS2812_util.h"

Servo myServo;

int oscillationTime = 500;
String chipID;
String serverURL = SERVER_URL;
String expressURL = EXPRESS_URL;
int volumeState = 0;
OpenWiFi hotspot;

void printDebugMessage(String message) {
#ifdef DEBUG_MODE
  Serial.println(String(PROJECT_SHORT_NAME) + ": " + message);
#endif
}

void setup()
{
  pinMode(TILT_RIGHT, INPUT);
  pinMode(TILT_LEFT, INPUT);
  pinMode(VIBRATION, OUTPUT);
  pinMode(RGB_RED, OUTPUT);
  pinMode(RGB_GREEN, OUTPUT);
  pinMode(RGB_BLUE, OUTPUT);

  Serial.begin(115200); Serial.println("");
  strip.begin();
  strip.setBrightness(255);
  fadeToColor(0, 255, 255, 0.0);
  setAllPixels(0, 255, 255, 1.0);

  WiFiManager wifiManager;
  int counter = 0;

  pinMode(BUTTON_PIN, INPUT_PULLUP);

  while (digitalRead(BUTTON_PIN) == LOW)
  {
    counter++;
    delay(10);

    if (counter > 500)
    {
      wifiManager.resetSettings();
      printDebugMessage("Remove all wifi settings!");
      setAllPixels(255, 0, 0, 1.0);
      fadeBrightness(255, 0, 0, 1.0);
      ESP.reset();
    }
  }

  hotspot.begin(BACKUP_SSID, BACKUP_PASSWORD);

  chipID = generateChipID();
  printDebugMessage(String("Last 2 bytes of chip ID: ") + chipID);
  String configSSID = String(CONFIG_SSID) + "_" + chipID;

  wifiManager.autoConnect(configSSID.c_str());
  fadeBrightness(0, 255, 255, 1.0);
}

//This method starts an oscillation movement in both the LED and servo
void oscillate(float springConstant, float dampConstant, int c)
{
  SpringyValue spring;

  byte red = (c >> 16) & 0xff;
  byte green = (c >> 8) & 0xff;
  byte blue = c & 0xff;

  spring.c = springConstant;
  spring.k = dampConstant / 100;
  spring.perturb(255);
  fadeToColor(red, green, blue, 0.0);

  //Start oscillating
  for (int i = 0; i < oscillationTime; i++)
  {
    spring.update(0.01);
    setAllPixels(red, green, blue, 1.0);
    myServo.write(90 + spring.x / 4);

    //Check for button press
    if (digitalRead(BUTTON_PIN) == LOW)
    {
      //Fade the current color out
      fadeBrightness(red, green, blue, 1.0);
      return;
    }
    delay(10);
  }
  fadeBrightness(red, green, blue, 1.0);
}

void loop()
{
  if (digitalRead(TILT_RIGHT) == 1 && volumeState != 1) {
    volumeState = 1;
    analogWrite(RGB_RED, 0);
    analogWrite(RGB_GREEN, 250);
    analogWrite(RGB_BLUE, 0);
    digitalWrite(VIBRATION, HIGH);
    printDebugMessage("volume up");
    sendExpressPress("up");
  } else if (digitalRead(TILT_LEFT) == 1 && volumeState != -1) {
    volumeState = -1;
    analogWrite(RGB_RED, 250);
    analogWrite(RGB_GREEN, 0);
    analogWrite(RGB_BLUE, 0);
    digitalWrite(VIBRATION, HIGH);
    printDebugMessage("volume down");
    sendExpressPress("down");
  } else if (digitalRead(TILT_RIGHT) == 0 && digitalRead(TILT_LEFT) == 0) {
    volumeState = 0;
    analogWrite(RGB_RED, 0);
    analogWrite(RGB_GREEN, 0);
    analogWrite(RGB_BLUE, 250);
    digitalWrite(VIBRATION, LOW);
  }
  delay(100);
}

void sendExpressPress(String volumeKey)
{
  //Express server api call
  printDebugMessage("Sending button press to node server");
  String url = expressURL + "/api/volume?direction=";
  HTTPClient http;
  http.begin(url + volumeKey);
  int httpCode = http.GET();

  if (httpCode == 200) {
    String res;
    res = http.getString();
    if (res) { printDebugMessage("Express response: " + res); }
    else { printDebugMessage("Something went wrong"); }
  } else {
    printDebugMessage("Connection failed. Return " + String(httpCode));
  }
  
  http.end();
}

String generateChipID()
{
  String chipIDString = String(ESP.getChipId() & 0xffff, HEX);

  chipIDString.toUpperCase();
  while (chipIDString.length() < 4)
    chipIDString = String("0") + chipIDString;

  return chipIDString;
}


