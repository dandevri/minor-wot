# minor-wot
![Badge_ianparse](https://img.shields.io/badge/%E2%9C%A8%20ian%20parse%20-json-ff69b4.svg)
![Badge_spoofy](https://img.shields.io/badge/skip%20station-%F0%9F%94%8A%20spoofy-green.svg)

![Github_Banner](Github_Banner.jpg)
> Spotify voting system using IoT devices.

## :book: Introduction
The Spoofy Skip Station *(SSS)* is an WoT application to be used in public and open spaces. Consider the following use case:

> Let's say you have a classroom full of students and there is an open Spotify playlist playing through the speakers. With a wooden box the students can vote to skip to the next song. If the song has an X number of "skip votes" the audio systems skips to the next song.  

> With the added control system another connected box can control the volume for the whole room.

* Voting system: Used to vote to skip the song.
* Control system: Control the volume in the room.

## ⚙ Installation & Development
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites
#### Software
* Make sure you have [`node`](https://nodejs.org/en/) installed on your machine.
* Install Arduino [`IDE`](https://www.arduino.cc/en/Main/Software) on your machine.

#### Hardware
* Make sure you have the right hardware requirements
  * NodeMCU microcontroller
  * Arduino red push button
  * 2x Tilt Switch Module (kwik)
  * Vibration motor
  * RGB led
  * Adafruit Led Strip

### Installing
Here are the instructions to get the node server up and running.

1. Clone this project to your local machine and change directory
```bash
$ git clone https://github.com/dandevri/minor-rtw.git && cd minor-rtw
```
1.  Install the dependencies and start the server
```bash
$ npm start
```

You should see the following message in your terminal.
> Server running `0.0.0.0`:`3000`

:tada: It has works!

## :white_check_mark: Todo's
To see all upcoming todo's and features please navigate to the [GitHub Projects](https://github.com/dandevri/minor-wot/projects/) page of this repo.

## :page_facing_up: Contributing
Please read [Contributing](CONTRIBUTING.md) for details on how to contribute to this project.
To see a list of everybody who participated go to the [Contributors](https://github.com/dandevri/minor-wot/graphs/contributors) page.

## Team

![Ian Stewart](https://avatars2.githubusercontent.com/u/14125280?v=3&s=400) | ![Mirza van Meerwijk](https://avatars0.githubusercontent.com/u/12242967?v=3&s=400) | ![Danny de Vries](https://avatars2.githubusercontent.com/u/22084444?v=3&s=400) 
---|---|---|---|---|---
[Ian Stewart](https://github.com/IanCStewart) | [Mirza van Meerwijk](https://github.com/Mimaaa) | [Danny de Vries](https://github.com/dandevri)

## License
This project is licensed under the [MIT](LICENSE.MD) License
