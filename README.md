Data-Pichio
===========

Agressively capture data from a Wifi-SD-Card, encrypting and storing using a
public key.

Pichio(read this in German, that's what I can to describe the sound) is an
animal in the stories of China, which is a luckly animal that only eats but no
excretes.

Written in `Node.JS`, this is a daemon that agressively collects new files from
a data source, possibly from a SD-Card together with WiFi function, in which
case the card sets up a WiFi hotspot to enable downloading photos during
running and via Wireless LAN.

You, who is anonymously standing at some distance from this hotspot, is holding
a briefcase, in which the Data-Pichio collects such photos and stores them
encrypted in your laptop. Even if you are found, no data in your computer is
able to be proved being the photos.

Sample Key
----------

The sample key sent to this repository have a corresponding private key of
following. **DO NOT make your own private key public, and DO NOT use this
out-of-box private key!! You have been warned!**

    9d3c66ab edb914e7 4e453c12 7b7320d7 5cd78d63 69e26b36 0f824605 8e3ef52c 

------------------------------------------------------------------------------

数据貔貅
========

贪婪地从Wifi-SD卡上收集数据并加密存储于本地。

貔貅是中国神话故事中的动物，只吃不排泄，代表着好运。

本程序使用`Node.JS`编写，运行后将贪婪地从一个数据源，比如Wifi-SD卡下载新的文件。
Wifi-SD卡是启动后能产生一个Wifi热点，然后允许通过无线LAN访问其数据的设备。

而您，就不引人注意地站在这个热点附近，提着手提箱，里面是您运行中的笔记本电脑。
在笔记本电脑上，数据貔貅收集热点上的照片并加密存储。即使之后您被发现，也没什么
可以证明这些加密的文件就是照片。

示例密钥
--------

公布在本库配置文件中的公钥对应的私钥如下。**您不能公开自己的私钥！也不要使用这
个自带的私钥！勿谓吾言之不预！**

    9d3c66ab edb914e7 4e453c12 7b7320d7 5cd78d63 69e26b36 0f824605 8e3ef52c 
