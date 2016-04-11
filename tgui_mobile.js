/**
 * TGUI_MOBILE v1.0.0
 *
 * dependencies: 
 *   Zepto: [touch, selector, data, Callback, defferd]
 *   fontAwesome
 *
 * css:
 *     [font-awesome.css, tgui_mobile.css]
 *
 * 设计稿为：750px
 *
 * auchor : echo
 * 
 * Licensed under MIT
 * Released on: Mar 25, 2016
 * 
 */
window.TGUIMobile  = (function($){
    'use strict';

    var doc = document,
        $win = $(window),
        docEl = doc.documentElement;

    var isUndefined = function(param){
        return (typeof param === 'undefined');
    };

    //动态加载css、js文件
    var require = function(moduleSrc){
        var i          = 0;
        var head       = $('head')[0];
        var module     = moduleSrc.replace(/\s/g, '');
        var iscss      = /\.css$/.test(module);
        var node       = document.createElement(iscss ? 'link' : 'script');
        var path       = document.currentScript.src;
        var modulePath = path.replace(/\w+\.js$/,module);

        //生成id
        var id = module.replace(/\.|\/|\:/g, '');

        if(iscss){
            node.rel = 'stylesheet';
        }
        node[iscss?'href':'src'] = /^http:\/\//.test(module) ? module : modulePath;
        node.id = id;
        if(!$('#'+id).length){
            head.appendChild(node);
        }
    };

    //通用动画方法
    $.fn.transform = function (transform) {
        for (var i = 0; i < this.length; i++) {
            var elStyle = this[i].style;
            elStyle.webkitTransform = elStyle.MsTransform = elStyle.msTransform = elStyle.MozTransform = elStyle.OTransform = elStyle.transform = transform;
        }
        return this;
    };

    $.fn.transition = function (duration) {
        if (typeof duration !== 'string') {
            duration = duration + 'ms';
        }
        for (var i = 0; i < this.length; i++) {
            var elStyle = this[i].style;
            elStyle.webkitTransitionDuration = elStyle.MsTransitionDuration = elStyle.msTransitionDuration = elStyle.MozTransitionDuration = elStyle.OTransitionDuration = elStyle.transitionDuration = duration;
        }
        return this;
    };


    /**==============================================================
     * 
     * 弹出框
     *
     *  调用方式：layIndex = TGUIMobile.layer.open(options)
     *
     *  options -> json
           title：'标题',
           className: '',
           shade：true||false, //是否显示阴影
           closeIcon: true || false
           button:{
               "showBtn":true,  
               "btns":[{//btn数组
                    "valueStr":btn显示内容,
                    "callback": function, //点击该按钮的回调方法，默认为layerClose
                    "className":btn className
                }]  
           }
           "position": [left||right||center,top||bottom||center], // 位置
           "content":"html-str", //内容
      
        关闭:
            TGUIMobile.layer.close(layIndex)
      
       eg:
        var layer = window.TGUIMobile.layer.open({
            title: '测试',
            shade:true,
            button:{
                "showBtn":true,
                'btns':[{
                    'valueStr':'取消',
                    'className':'ajly-btn-trans'
                },{
                    'valueStr':'马上下载'
                }]
            },
            content:'oh shit'
        });
      
        function cancelCallback(layer){
            window.TGUIMobile.layer.close(layer)
        }
     *      
     *===================================================================**/
    var layer = (function(){

        //路径改变，此处代码需要修改
        /*var getUICSS = function(){
            var jsSrc = document.currentScript.src;
            var cssSrc = jsSrc.replace(/\/js\//, '\/css\/').replace(/\.js/, '\.css');
            return cssSrc;
        };
        require(getUICSS());*/

        var defaults = {
                'width': '640px',
                "button": {
                    "showBtn": true
                },
                "shade": true,
                'dragable':false
            },
            //唯一标示
            layIndex = 0,

            domStrs = ['ajly-wraper', 'ajly-close','ajly-title', 'ajly-main','ajly-footer', 'ajly-btn','ajly-html'];

        var LayerClass = function(options){

            var _ = this;
            _.layIndex = ++layIndex;
            _.settings = $.extend({}, defaults, options);
            _.init();
        };

        var lpt = LayerClass.prototype;

        lpt.init = function(){
            var settings = this.settings || {},
                dragable = settings.dragable || false,
                that = this;

            //创建模板
            this.createVessel();

            //初始化按钮
            this.initLayerBtns();

            //宽高和位置
            this.layerOffset();

            $win.on("resize."+this.layIndex, function() {
                that.layerOffset();
            }, false);
        };

        lpt.createVessel = function(){
            var that = this,
                settings = this.settings;

            var shade     = !!(settings.shade);
            var closeIcon = !!(settings.closeIcon);
            var className = settings.className || '';

            var layerHtmlTmpl = ['<div class="'+domStrs[0]+ " " +className+'" id="' + domStrs[0] + this.layIndex + '">',
                shade ? '<div class="ajly-mask"></div>' : '',
                '   <div class='+domStrs[3]+'>',
                '       <div class="ajly-header">',
                            closeIcon?'<i class='+domStrs[1]+'>×</i>':'',
                '           <div class='+domStrs[2]+'>' + (settings.title ? settings.title : '') + '</div>',
                '       </div>',
                '       <div class="ajly-content">',
                            settings.content ? settings.content : "",
                '       </div>',
                '       <div class='+domStrs[4]+'  id='+domStrs[4]+'>',
                '       </div>',
                '   </div>',
                '</div>'
            ].join("");

            if(shade){
                 $(docEl).addClass(domStrs[6]);
            }

            this.$layerFragment = $(layerHtmlTmpl);

            closeIcon && this.$layerFragment.on('tap', '.'+domStrs[1], function() {
                that.closeLayer();
                return false;
            });

        };

        //初始化按钮
        lpt.initLayerBtns = function() {
            var btnElement, $btnElement;
            var that     = this;
            var settings = this.settings;
            var button   = settings.button || {};
            var btns     = button && button.btns;
            var btnsLen  = (btns && btns.length) || 0;
            var i        = 0;
            var $layer   = this.$layerFragment;

            var btnCloseLayer = function(){
                that.closeLayer();
            };

            //是否显示按钮
            if (button.showBtn) {
                if (btnsLen) {
                    for (; i < btnsLen; i++) {
                        btnElement = btns[i];
                        $btnElement = $('<button class="' +domStrs[5] +' '+ (btnElement.className|| '') +'">' + btnElement.valueStr + '</button>');
                        $btnElement.tap(btnElement.callback || btnCloseLayer);
                        $layer.find("#"+domStrs[4]).append($btnElement);
                    }
                } else {
                    //默认显示确定按钮
                    $btnElement = $('<button class="'+ domStrs[5] +'">确定</button>');
                    $btnElement.tap(function(){
                        that.closeLayer();
                    });
                    $layer.find("#"+domStrs[4]).append($btnElement);
                }
                
            }
        };

        //位置和宽高设置
        lpt.layerOffset = function() {
            var width,
                x_area,y_area,
                xpos, ypos,xposkey,yposkey;
            var settings      = this.settings;
            var $layer        = this.$layerFragment;
            var winHeight     = $win.height();
            var winWidth      = $win.width();
            var positionStyle = {};
            var position      = settings.position || [];
            var $ajlyMain     = $layer.find("."+domStrs[3]);

            width = settings.width;
            $ajlyMain.css({
                "width": width,
                "height": 'auto'
            });

            if(!$('#'+domStrs[0] + this.layIndex, doc.body).length){
                $(doc.body).append($layer);
            }

            x_area = parseInt($ajlyMain.width(), 10);
            y_area = parseInt($ajlyMain.height(), 10);

            if(position[0] && (position[0] === 'left' || position[0]==='right')){
                xpos = 0;
                xposkey = position[0];
                positionStyle[xposkey] = xpos;
            }
            else{
                xpos = (winWidth - x_area) / 2;
                xpos = (xpos > 0 ? xpos : 0);
                positionStyle.left = xpos;
            }

            if(position[1] && (position[1] === 'top' || position[1] === 'bottom')){
                xpos = 0;
                yposkey = position[1];
                positionStyle[yposkey] = xpos;
            }
            else{
                ypos = (winHeight - y_area) / 2;
                ypos = (ypos > 0 ? ypos : 0);
                positionStyle.top = ypos;
            }

            $ajlyMain.css(positionStyle);
        };

        //关闭
        lpt.closeLayer = function(layerId) {

            layerId = domStrs[0] + (layerId || this.layIndex);
            $(docEl).removeClass(domStrs[6]);
            $win.off("resize."+this.layIndex);
            $("#" + layerId).remove();
        };

        var layer = {
            vertion: '1.0',
            open:function(options){
                var layer = new LayerClass(options);
                return layer.layIndex;
            },
            close:function(layerIndex){
                lpt.closeLayer(layerIndex);
            }

        };

        return layer;
    })();


    /**=====================================================================
     * 为input输入框添加清楚按钮、显示密码按钮等
     * 
     * 调用方式：
     *    $('input').ajInputOprateIcon({
     *        className: 'class' //自定义class名称
     *    });
     * 
     * ===================================================================**/

    //TODO bug 横竖屏切换bug
    (function(){
        var _domStrs = ['ajic-wraper','ajic-delIcon', 'ajic-togglePassIcon', 'ajic-delIconWraper', 'ajic-PassIconWraper'];
        
        $.fn.ajInputOprateIcon = function(options){

            var _timeoutId;
            var _settings = $.extend({}, $.fn.ajInputOprateIcon.defaults, options);
            //保持链式调用
            //过滤掉非内容输入框的input
            return this.filter('input')
                .each(function(){
                    var _$passIcon;

                    var _$this     = $(this);
                    var _$wraper   = $('<div class="'+_domStrs[0]+' '+ (_settings.className||'')+'"></div>');
                    var _$delIcon  = $('<span class='+_domStrs[3]+'><i class="fa fa-times"></i></span>');
                    var _width     = _$this.width() || '100%';
                    var _display   = _$this.css('_display') || 'inline-block';
                    var _height    = _$this.height() || '100px';
                    var _type      = _$this.attr('type');
                    var _iconWidth = _height*3/5;

                    _$wraper.css({
                        width:_width,
                        display:_display
                    });

                    _$delIcon.css({
                        height:_height,
                        width:_iconWidth,
                        'line-height': _height+'px'
                    });

                    _$this.wrap(_$wraper);
                    _$wraper.append(_$delIcon);

                    if(_type === 'password'){
                        _$passIcon = $('<span class='+_domStrs[4]+'><i class="fa fa-eye"></i></span>');

                        _$passIcon.css({
                            height:_height,
                            width:_iconWidth,
                            'line-height': _height+'px',
                            right:_iconWidth+10
                        });

                        _$passIcon.click(function(){
                            clearTimeout(_timeoutId);
                            event.preventDefault();
                            event.stopPropagation();

                            var _inputType = _$this.attr('type');
                            var _$toogleIcon = _$passIcon.find('i');
                            if(_inputType === 'password'){
                                _$this.attr('type', 'url').focus();
                                _$toogleIcon.addClass('fa-eye-slash').removeClass('fa-eye');
                            } else {
                                _$this.attr('type', 'password').focus();
                                _$toogleIcon.addClass('fa-eye').removeClass('fa-eye-slash');
                            }
                            
                        });

                        _$wraper.append(_$passIcon);
                        _$this.data(_domStrs[2], _$passIcon);
                    }

                    _$this.data(_domStrs[0], _$wraper);
                    _$this.data(_domStrs[1], _$delIcon);

                    _$delIcon.click(function(event){
                        clearTimeout(_timeoutId);
                        event.preventDefault();
                        event.stopPropagation();

                        _$this.val('').focus();
                           $(this).hide();  
                    });
                })
                .on('focus.opretaIcon keyup', showIcons)
                .on('blur.opretaIcon', function(){
                    var _$this = $(this);
                    _timeoutId = setTimeout(function(event){
                        hideIcons(event, _$this); 
                    },200);   
                });
        };

        function showIcons(event){
            event.preventDefault();
            event.stopPropagation();

            var _$this     = $(this);
            var _value     = _$this.val();
            var _$delIcon  = _$this.data(_domStrs[1]);
            var _$passIcon = _$this.data(_domStrs[2]);

            //如果值为空，不显示delIcon
            if(!_value){
                _$delIcon&&_$delIcon.hide();
                _$passIcon&&_$passIcon.hide();
                return false;
            }

            _$delIcon&&_$delIcon.show(); 
            _$passIcon&&_$passIcon.show();
            return true;
        }

        function hideIcons(event, targetObj){
            var _$this     = targetObj;
            var _$delIcon  = _$this.data(_domStrs[1]);
            var _$passIcon = _$this.data(_domStrs[2]);

            _$delIcon && _$delIcon.hide();
            _$passIcon && _$passIcon.hide();
        }

        //Default settings
        $.fn.ajInputOprateIcon.defaults = {}

    })();

    /**=====================================================================
     * 轮播
     *  HTML目录结构
     *    <div class="aj-slideContainer">
     *       <div class="aj-slideWraper">
     *           <div class="aj-slide">1</div>
     *           <div class="aj-slide">2</div>
     *           <div class="aj-slide">3</div>
     *           <div class="aj-slide">4</div>
     *       </div>
     *    </div>
     *
     * 
     * ===================================================================**/
    (function(){
        var domStrs = ['aj-slideContainer', 'aj-slideWraper', 'aj-slide'];

        var ajSlider = function(element, settings){
            var $firstSlide;
            var _this        = this;
            var $element     = $(element);
            var $slideWraper = $element.find('.'+domStrs[1]);
            var $slides      = $slideWraper.find('.'+domStrs[2]);
            var slideCount   = $slides.length;
            var wraperWidth  = $element.width();
            var column       = settings.column || 1;
            var slideWidth   = Math.ceil( wraperWidth / column );
            var delay        = settings.pauseTime || 3000;
            var loop         = settings.loop;
            var speed        = settings.animSpeed

            if(loop){
                $firstSlide = $( $slideWraper.find('.'+domStrs[2])[0] ).clone();
                $slideWraper.append($firstSlide);
                slideCount += 1;
            }

            this.settings     = settings || {};
            this.slideWidth   = slideWidth;
            this.slideWraper  = $slideWraper;
            this.containter   = $element;
            this.currentIndex = settings.settings || 0; 
            
            $slideWraper.css({
                width: slideWidth * slideCount
            });

            $slideWraper.transition(speed);
        };

        var spt = ajSlider.prototype;

        spt.slideTo = function(index){

            console.log(Math.random());

            var length = this.slideWraper.find('.'+domStrs[2]).length;

            if(isUndefined(index) || index<0) index = 0;
            if(index > (length-1)){
                index = length-1;
            } 

            this.currentIndex = index;

            var _this      = this;
            var $this      = $(_this);
            var translateX = -(index * this.slideWidth);
            var speed      = this.settings.animSpeed || 500;
            if (this.support.transforms3d){
                this.slideWraper.transform('translate3d(' + translateX + 'px, 0px, 0px)');  
            } else {
                s.slideWraper.transform('translate(' + translateX + 'px, 0px)')
            } 

        };

        spt.autoplay = function(){
            var timeoutId;
            var _this    = this;
            var settings = _this.settings;
            var pausing  = _this.pausing;
            var length   = _this.slideWraper.find('.'+domStrs[2]).length;
            var delay    = settings.pauseTime;
            var duration = settings.duration;
            var loop     = settings.loop;
            var speed    = settings.animSpeed || 500;


            var index    =_this.currentIndex + 1;
            if(pausing){
                index = index - 1 ;
            }
            _this.slideTo(index);

            if((length - 1) === index){
                if(!loop){
                    return false;
                }
                else{
                    setTimeout(function(){
                        _this.slideWraper.transition(0);
                        _this.slideTo(0);
                    }, speed);
                }
            }

            timeoutId = setTimeout(function(){
                _this.slideWraper.transition(speed);
                _this.autoplay();
            }, delay);

            return timeoutId;
        }

        spt.support = {
            transforms3d : (window.Modernizr && Modernizr.csstransforms3d === true) || (function () {
                var div = document.createElement('div').style;
                return ('webkitPerspective' in div || 'MozPerspective' in div || 'OPerspective' in div || 'MsPerspective' in div || 'perspective' in div);
            })(),
        };
        
        $.fn.ajSlider = function(options){
            var settings = $.extend({}, $.fn.ajSlider.defaults, options);

            return this.each(function(index,element){
                var $element    = $(element);
                var ajSliderEle = $element.data('ajSlider');
                var autoplay    = settings.autoplay;
                var delay       = settings.pauseTime;

                if(ajSliderEle) return;

                ajSliderEle = new ajSlider($element, settings);
                if(autoplay){
                    setTimeout(function(){
                        ajSliderEle.autoplay();
                    }, delay);
                }

                ajSliderEle.index = index;
                $element.data('ajSlider', true);
            });
        }

        //Default settings
        $.fn.ajSlider.defaults = {
            startSlide:0, 
            animSpeed: 500,
            pauseTime: 3000,
            autoplay: true,
            pagination:true,
            column: 1,
            loop:true
        };
    })();
    
    

    return {
        layer: layer
    };

})(Zepto);