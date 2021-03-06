(function($){

   
   var util = {
      applyDefaults: function(a,b){
         for(var k in b){
            if(b.hasOwnProperty(k)){
               if(typeof(b[k]) == 'object'){
                  if(a[k] === undefined)
                     a[k] = {};
                  util.applyDefaults(a[k],b[k]);
               }else if($.isArray(b[k])){
                  if(a[k] === undefined)
                     a[k] = [];
                  util.applyDefaults(a[k],b[k]);
               }else{
                  if(a[k] === undefined)
                     a[k] = b[k];
               }
            }
         }
      },
      id: function(pref){
         return (pref || 'gen') + '-' + __ID_SEQ++;
      },
      ext: function(a, b){
         var oa = $.isFunction(a) ? a.prototype : a;
         var ob = $.isFunction(b) ? b.prototype : b;
         $.extend(oa, ob);
         if($.isFunction(a) && $.isFunction(b)){
             a.superclass = ob;
         }
      },
      each: function(iterable, callback, scope){
         scope = scope || window;
         var i = 0;
         for(var k in iterable){
            if(iterable.hasOwnProperty(k)){
               var v = iterable[k];
               if(callback.call(scope, k, v, i) === false){
                  break;
               }
               i++;
            }
         }
      },
      isMobilePlatform: function(){
		 return (/iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase()));
	  }
   };
   
   
   var Widget = function(cfg){
      cfg = cfg ||{};
      $.ext(this, cfg);
      
      this.placeholder = this.placeholder || document.body;
      var self = this;
      
      var m = [
         '<div class="widget-wrapper corner-all ',(cfg.extraClass || ''),'">',
            '',
         '</div>'
      ].join('');
      
      this.el = $(m)[0];
      $(this.placeholder).append(this.el);
      
      
      var events = {};
      
      this.on = function(name, callback){
         var es = events[name] || [];
         var self = this;
         var wrapper = function(){
            var args = Array.prototype.splice.call(arguments, 0, arguments.length);
            callback.apply(self, [self].concat(args));
         };
         
         es.push({
            callback: callback,
            wrapper: wrapper
         });
         events[name] = es;
         $(this.el).bind(name, wrapper);
      };
      
      this.removeListener = function(name, callback){
         var es = events[name];
         if(es){
            if(callback){
               util.each(events, function(i, r){
                  if(r.callback == callback){
                     $(this.el).unbind(name, r.wrapper);
                     return false;
                  }
               }, this);
            }else{
               $(this.el).unbind(name);
            }
         }
      };
      
      this.trigger = function(){
         var name = arguments[0];
         if(name && arguments.length){
            var args = Array.prototype.splice.call(arguments, 1, arguments.length-1);
            $(this.el).trigger(name, args);
         }
      };
      
      this.init();
   };
   
   util.ext(Widget, {
      init: function(){}
   });
   
   
   var __Cordova = {};
   
   // Accelerometer
   var Accelerometer = function(){
      this.watches = {};
      this.acc = {
         x: 0,
         y: 0,
         z: 0
      };
      this.__id_seq = 0;
      this.step = 0.1;
   };
   
   util.ext(Accelerometer, {
      getCurrentAcceleration: function(success, error){
         this.__callAcc(success, error);
      },
      __callAcc: function(success, error){
         var acc = {
            timestamp: new Date().getTime()
         };
         if(this.simulateError){
            if(error) error();
         }else{
            utils.ext(acc, this.acc);
            if(success)success(acc);
         }
      },
      watchAcceleration: function(success, error, options){
         var watchId = "watch-"+this.__id_seq++;
         var watch = {
            success: success,
            error: error
         };
         this.watches[watchId] = watch;
         options = options || {};
         var interval = options.frequency || 10000;
         var self = this;
         watch.intervalId = setInterval(function(){
            var w = self.watches[watchId];
            if(w){
               self.__callAcc(w.success, w.error);
            }
         }, interval);
      },
      clearWatch: function(watchId){
         if(this.watches[watchId])
            delete this.watches[watchId];
      },
      __explicitCall: function(){
         for(var wid in this.watches){
            if(this.watches.hasOwnProperty(wid)){
               this.__callAcc(this.watches[wid].success, this.watches[wid].error);
            }
         }
      },
      __show: function(){
         var m = [
            '<div class="widget-wrapper accelerometer-widget corner-all">',
               '<div class="widget-header">Accelerometer</div>',
               '<div>',
                  '<label class="dbg-label">X:</label>',
                  '<input type="button" class="dbg-input dbg-button value-inc" value="+" axis="x"/>',
                  '<input type="text" class="dbg-input dbg-input-short dbg-text value-input axis-x" value="', this.acc.x, '" axis="x"/>',
                  '<input type="button" class="dbg-input dbg-button value-dec" value="-" axis="x"/>',
               '</div>',
               '<div>',
                  '<label class="dbg-label">Y:</label>',
                  '<input type="button" class="dbg-input dbg-button value-inc" value="+" axis="y"/>',
                  '<input type="text" class="dbg-input dbg-input-short dbg-text value-input axis-y" value="', this.acc.y, '" axis="y"/>',
                  '<input type="button" class="dbg-input dbg-button value-dec" value="-" axis="y"/>',
               '</div>',
               '<div>',
                  '<label class="dbg-label">Z:</label>',
                  '<input type="button" class="dbg-input dbg-button value-inc" value="+" axis="z"/>',
                  '<input type="text" class="dbg-input dbg-input-short dbg-text value-input axis-z" value="', this.acc.z, '" axis="z"/>',
                  '<input type="button" class="dbg-input dbg-button value-dec" value="-" axis="z"/>',
               '</div>',
               '<div>',
                  '<input type="button" class="dbg-input dbg-button action action-trigger" value="Trigger"/>',
                  '<input type="button" class="dbg-input dbg-button action action-close" value="Close"/>',
               '</div>',
            '</div>'
         ].join('');
         var self = this;
         var el = $(m)[0];
         
         var update = function(){
            $('.axis-x',el).val(self.acc.x);
            $('.axis-y',el).val(self.acc.y);
            $('.axis-z',el).val(self.acc.z);
         };
         
         $('.value-inc', el).click(function(){
               self.acc[$(this).attr('axis')] += self.step;
               update();
         });
         $('.value-dec', el).click(function(){
               self.acc[$(this).attr('axis')] -= self.step;
               update();
         });
         $('.action-trigger',el).click(function(){
            self.__explicitCall();
         });
         $('.action-close',el).click(function(){
            $(el).remove();
         });
         
         $('.value-input',el).change(function(){
            var value = $('.value-input', $(this).parent()).val();
            if(value !== undefined && $.trim(value) != ''){
               self.acc[$(this).attr('axis')] = parseFloat(value);
            }
         });
         
         document.body.appendChild(el);
      }
   });
   
   /////////////////////////////////////////////////////////////////////////////
   // Camera
   
   var Camera = function(config){
      config = config || {};
      this.imagePath = config.imagePath || 'img/dbg-image';
      this.simulateError = config.simulateError;
   };
   
   Camera.DestinationType = {
        DATA_URL : 0,                // Return image as base64 encoded string
        FILE_URI : 1,                // Return image file URI
        NAMES: {
           0: 'Data URL (Base 64 encoded data)',
           1: 'File URI (Path)' 
        }
    };

   Camera.PictureSourceType = {
       PHOTOLIBRARY : 0,
       CAMERA : 1,
       SAVEDPHOTOALBUM : 2,
       NAMES:{
         0: 'Photo Library',
         1: 'Camera',
         2: 'Saved Photo Album'
       }
   };
   
   Camera.EncodingType = {
        JPEG : 0,               // Return JPEG encoded image
        PNG : 1,                // Return PNG encoded image
        NAMES: {
            0: 'JPEG image',
            1: 'PNG image'
        }
    };

   Camera.MediaType = { 
      PICTURE: 0,             // allow selection of still pictures only. DEFAULT. Will return format specified via DestinationType
      VIDEO: 1,               // allow selection of video only, WILL ALWAYS RETURN FILE_URI
      ALLMEDIA : 2            // allow selection from all media types
   };
   
    Camera.PopoverArrowDirection = {
        ARROW_UP : 1,        // matches iOS UIPopoverArrowDirection constants
        ARROW_DOWN : 2,
        ARROW_LEFT : 4,
        ARROW_RIGHT : 8,
        ARROW_ANY : 15,
        NAMES:{
          1: 'Up',
          2: 'Down',
          4: 'Left',
          8: 'Right',
         15: 'Any',
         getNames: function(v){
            if(v == 15)
               return 'Any';
            var arrs = [];
            var m = [1,2,4,8];
            for(var i = 0; i < m.length; i++){
               if(v&i){
                  arrs.push(Camera.PopoverArrowDirection.NAMES[i]);
               }
            }
            return arrs.join(',');
         }
        }
    };

   
   util.ext(Camera, {
      getPicture: function(success, error, opt){
         opt = opt || {};
         var self = this;
         
         var defaults = {
            quality : 75, 
            destinationType : Camera.DestinationType.DATA_URL, 
            sourceType : Camera.PictureSourceType.CAMERA, 
            allowEdit : true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 100,
            targetHeight: 100,
            popoverOptions: { 
              x : 0, 
              y :  32,
              width : 320,
              height : 480,
              arrowDir : Camera.PopoverArrowDirection.ARROW_ANY
            },
            saveToPhotoAlbum: false
         };
         util.applyDefaults(opt, defaults);
         
         
         
         var imgUrl = this.imagePath + '.' + 
            (opt.encodingType == Camera.EncodingType.JPEG ? 'jpeg' : 'png') + 
            (opt.destinationType == Camera.DestinationType.DATA_URL ? '.b64' : '');
         
         var displayCameraConfirm = function(data, isUrl){
            var m = [
               '<div class="widget-wrapper camera-wrapper corner-all">',
                  '<div class="">',
                     '<div>',
                        '<label class="dbg-label">Quality: </label>',
                        '<span class="dbg-value">',
                         opt.quality,
                        '</span>',
                     '</div>',
                     '<div>',
                        '<label class="dbg-label">Destination Type: </label>',
                        '<span class="dbg-value">&nbsp;',
                        Camera.DestinationType[opt.destinationType],
                        '</span>',
                     '</div>',
                     '<div>',
                        '<label class="dbg-label">Source Type: </label>',
                        '<span class="dbg-value">',
                         Camera.PictureSourceType.NAMES[opt.sourceType],
                        '</span>',
                     '</div>',
                     '<div>',
                        '<label class="dbg-label">Editable: </label>',
                        '<span class="dbg-value">',
                         opt.allowEdit ? 'Yes' : 'No',
                        '</span>',
                     '</div>',
                     '<div>',
                        '<label class="dbg-label">Encoding Type: </label>',
                        '<span class="dbg-value">',
                        Camera.EncodingType.NAMES[opt.encodingType],
                        '</span>',
                     '</div>',
                     '<div>',
                        '<label class="dbg-label">Width: </label>',
                        '<span class="dbg-value">&nbsp;',
                         opt.width,
                        '</span>',
                     '</div>',
                     '<div>',
                        '<label class="dbg-label">Height: </label>',
                        '<span class="dbg-value">&nbsp;',
                        opt.height,
                        '</span>',
                     '</div>',
                     '<div>',
                        '<label class="dbg-label">Save to album: </label>',
                        '<span class="dbg-value">',
                        opt.saveToPhotoAlbum ? 'Yes' : 'No',
                        '</span>',
                     '</div>',
                     '<div>',
                        '<label class="dbg-label">PopOver - x: </label>',
                        '<span class="dbg-value">',
                         opt.popoverOptions.x,
                        '</span>',
                     '</div>',
                     '<div>',
                        '<label class="dbg-label">PopOver - y: </label>',
                        '<span class="dbg-value">',
                         opt.popoverOptions.y,
                        '</span>',
                     '</div>',
                     '<div>',
                        '<label class="dbg-label">PopOver - width: </label>',
                        '<span class="dbg-value">',
                         opt.popoverOptions.width,
                        '</span>',
                     '</div>',
                     '<div>',
                        '<label class="dbg-label">PopOver - height: </label>',
                        '<span class="dbg-value">',
                         opt.popoverOptions.height,
                        '</span>',
                     '</div>',
                     '<div>',
                        '<label class="dbg-label">PopOver - Arrow Direction: </label>',
                        '<span class="dbg-value">',
                        Camera.PopoverArrowDirection.NAMES.getNames(opt.popoverOptions.arrowDir),
                        '</span>',
                     '</div>',
                     '<div>',
                        (isUrl ? 
                           [
                              // generate img
                              '<img src="',
                              imgUrl,
                              '"/>'
                           ].join(''):
                           [
                              // generate textarea
                              '<textarea>',
                                 data,
                               '</textarea>'
                           ].join('') ),
                     '</div>',
                  '</div>',
                  '<div class="camera-controls">',
                    '<input type="button" value="Take Photo" class="take-photo"/>',
                    '<input type="button" value="Cancel" class="cancel-photo"/>',
                  '</div>',
               '</div>'
            ].join('\n');
            console.log(m);
            if(!self.camera_in_focus){
                var el = $(m)[0];
                $('.take-photo', el).click(function(){
                    if(success){
                        success.call(self, data);
                    }
                    $(el).remove();
                    self.camera_in_focus = false;
                });
                $('.cancel-photo',el).click(function(){
                    if(error){
                        error.call(self, 'camera-canceled');
                    }
                    $(el).remove();
                    self.camera_in_focus = false;
                });
                $(document.body).append(el);
            }else{
                if(error){
                    error.call(self, 'camera-in-focus');
                }
            }
         };
         
         
         
         
         if(opt.destinationType == Camera.DestinationType.DATA_URL){
            console.log('Requesting: ', imgUrl);
            $.ajax({
                success: function(data){
                    displayCameraConfirm(data,false);
                },
                url: imgUrl,
                dataType: 'text'
            });
            //$.get(imgUrl, function(data){
               
            //});
         }else{
            displayCameraConfirm('',true);
         }
      },
      cleanup: function(success, error){}
   });
   
   ///////////////////////////
   
   
   // Geolocation
   
   
   var Geolocation = function(config){
       
   };
   
   util.ext(Geolocation, {
        getCurrentPosition: function(success, error, options){},
        watchPosition: function(success, error, options){},
        clearWatch: function(watchId){}
   });
   
   
   /////////////////////////////
   
   // Connection
   
   var Connection = function(config){
        this.type = config.type || Connection.NONE;
   };
   Connection.UNKNOWN = "unknown";
   Connection.ETHERNET = "ethernet";
   Connection.WIFI = "wifi";
   Connection.CELL_2G = "2g";
   Connection.CELL_3G = "3g";
   Connection.CELL_4G = "4g";
   Connection.NONE = "none";
   
   
   ////////////////////////////
   
   // Storage
   
   
   var SQLResultSetList = function(data){
	   var rows = [].concat(data || []);
	   this.item = function(i){
		   return rows[i];
	   }
	   this.length = rows.length;
   };
   
   var SQLResultSet = function(insertId, affected, rsRowList){
	   this.insertId = insertId || 0;
	   this.rows = rsRowList || new SQLResultSetList([]);
	   this.rowsAffected = affected || 0;
   };
   
   
   var SQLTransaction = function(config){
      
   };
   util.ext(SQLTransaction, {
      executeSql: function(){
         var sql = arguments[0];
         var succId = typeof(arguments[1]) == 'function' ? 1 : 2;
         var params = succId == 1 ? [] : arguments[1];
         var success = arguments[succId];
         var error = arguments[succId+1];
         if(success){
            success.call(this, this, new SQLResultSet());
         }
      }
   });
   
   
   var Database = function(config){
      util.ext(this, config);
      
   };
   util.ext(Database, {
      transaction: function(txCallback, error, success){
         var tx = new SQLTransaction({});
         if(success){
        	txCallback.call(this, tx);
            success.call(this, tx);
         }
      },
      changeVersion: function(oldVersion, newVersion){
         
      }
   });
   
   Database.openDatabase = function(database_name, database_version, database_displayname, database_size){
      return new Database({
         database_name: database_name, 
         database_version: database_version, 
         database_displayname: database_displayname, 
         database_size: database_size
      });
   };
   
   
   ///////////////////////
   
   // Device object
   var DEVICE = {
      name: 'Passion', // (Nexus One code name)
      cordova: "2.1",
      platform: 'Android',
      uuid: '2000000103050709',
      version: "2.3.3"
      
   };
   
   // export to global scope
   // only if in browser PC
   if(!util.isMobilePlatform()){
	   window.accelerometer = new Accelerometer();
	   window.camera = new Camera();
	   
	   window.openDatabase = Database.openDatabase;
	   window.device = DEVICE;
	   navigator.network = window.network = {
	      connection: new Connection({})
	   };
	   navigator.connection = navigator.network.connection;
	   window.Connection = Connection;
   }
})(jQuery);
