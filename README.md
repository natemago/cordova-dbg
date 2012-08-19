Debugging bridge to the Apache Cordova JavaScript interface
===========================================================

Contains mock implementation of the Apache Cordova JavaScript interface to 
ease the usage of the Cordova framework during debugging on PC Browser.
With this library you can debug your Cordova (and PhoneGap) applications on 
PC browser.

How to use
===========

Drop the following snippet in your main HTML page:
<pre>
   &lt;link rel="stylesheet" href="lib/debug/css/dbg.css"/>
   &lt;link rel="stylesheet" href="lib/debug/css/widget.css"/>
      
   &lt;script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.8.0/jquery.min.js">&lt;/script>
   &lt;script type="text/javascript" src="lib/debug/cordova-dbg.js">&lt;/script>
</pre>
and you're ready to go. You'll be presented with Appropriate widgets to control
the inputs of the various devices (such as the Accelerometer, the Camera etc..).
*Remember to comment out the original import of cordova.js file, since it may
conflict with the debugging implementation*


Dependencies
============

As you probably noticed, the library depends on jQuery, so make sure you have it 
correctly included.

PhoneGap custom plugins
=======================

If you have your own custom plugins added to your application, they will not 
work. 
Of course, you can always mock them yourself.
