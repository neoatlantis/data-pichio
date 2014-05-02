Data-Pichio
===========

Agressively capture data from a Wifi-SD-Card, encrypting and storing using a
public key.

Pichio(read this in German, that's what I can to describe the sound) is an
animal in the stories of China, which is a luckly animal that only eats but no
excretes.

Written in `Node.JS`, this is a daemon that agressively collects new files from
a data source, possibly from a SDCard together with WiFi function, in which
case the card sets up a WiFi hotspot to enable downloading photos during
running and via Wireless LAN.

You, who is anonymously standing at some distance from this hotspot, is holding
a briefcase, in which the Data-Pichio collects such photos and stores them
encrypted in your laptop. Even if you are found, no data in your computer is
able to be proved being the photos.

Explanation
-----------

Firstly, you need a WiFi-SDCard. Insert it into your camera and start.

Then, configure your computer, so that the operating system connects this
WIFI hotspot automatically. Remember to ensure auto reconnection after the
connection is dead. The author doesn't know how to configure different
computers and thus will not discuss this further.

WiFi-SDCard allows its data being downloaded via a URL. And in our program
there is a configurable collector, which automatically accesses the SDCard
at intervals, and download new files.

After new files being downloaded in your computer, they will be stored after
encryption. Encryption is done with a public key, which appears with a private
key in pair. But when we use the public key to encrypt your data, it will be
only decryptable using a private key. At the first time of usage, the program
will choose for you the private key randomly, and derive its public key using
algorithms. You have to record the private key into a safe place, and copy
the public key into the configuration file.

At times when you use this software to collect the data, you **DO NOT NEED**
the private key. Put it in a secure place instead of the battle field! You
will need the private key only when extracting data from the system. Anyone
who have got your private key will be able to decrypt your data(and vice
versa)!



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

原理解释
--------

首先，您需要一个WiFi-SD卡。将其插入相机，然后启动。

之后，配置计算机，使得操作系统能自动连接这个SD卡上的WiFi。
请注意，要包括能断线后自动重连。作者不了解各种系统的各自配置情况，在此不录。

WiFi-SD卡可以通过网址下载数据。本程序有一个可以配置的收集器。
这个收集器定时尝试通过这种方法自动访问SD卡，然后收集其上的新文件。

在这些新的文件下载到您的计算机之后，它们将被加密存储。加密使用的技术是这样的，
它需要一种成对的密钥中的“公钥”部分。利用公钥加密您的数据后，要解密，能且只能使
用对应的私钥。在第一次使用时，程序会为您随机选取一个私钥，并通过特定的算法计算
出它对应的公钥。您将私钥安全地记录下来，将公钥数据拷贝到程序的配置文件中。

在您操作本软件收集数据时，您**不需要**使用私钥。请将它放在安全可靠的地方，而
不是现场！只有您从软件提取这些收集到的数据时，才需要私钥。任何人拿到了私钥，也
将能解密您收集到的数据，反之则不能。


示例密钥
--------

公布在本库配置文件中的公钥对应的私钥如下。**您不能公开自己的私钥！也不要使用这
个自带的私钥！勿谓吾言之不预！**

    9d3c66ab edb914e7 4e453c12 7b7320d7 5cd78d63 69e26b36 0f824605 8e3ef52c 
