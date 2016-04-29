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
        var modulePath = path.replace(/js\/\w+\.js$/,module);
        var targetTag;

        //生成id
        var id = module.replace(/\.|\/|\:/g, '');
        if(iscss){
            node.rel = 'stylesheet';
        }
        node[iscss?'href':'src'] = /^http:\/\//.test(module) ? module : modulePath;
        node.id = id;
        if(!$('#'+id).length){
            if(iscss){
                targetTag = head.getElementsByTagName('link')[0];
            } else {
                targetTag = document.currentScript;
            }
            head.insertBefore(node, targetTag);
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

    $.fn.transitionEnd = function (callback) {
        var events = ['webkitTransitionEnd', 'transitionend', 'oTransitionEnd', 'MSTransitionEnd', 'msTransitionEnd'],
            i, j, dom = this;
        function fireCallBack(e) {
            if (e.target !== this) {
                return; 
            }
            callback.call(this, e);
            for (i = 0; i < events.length; i++) {
                dom.off(events[i], fireCallBack);
            }
        }
        if (callback) {
            for (i = 0; i < events.length; i++) {
                dom.on(events[i], fireCallBack);
            }
        }
        return this;
    };

    // require('css/tgui_mobile.min.css');
    // require('css/font-awesome.min.css');
    
    /**==============================================================
     * 
     * 弹出框
     *
     *  调用方式：layIndex = TGUIMobile.layer.open(options)
     *
     *  options -> json
           title：'标题',
           className: '',
           shade：true||false, //是否显示遮罩层
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
            var that = this;

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

            if(closeIcon){
                this.$layerFragment.on('tap', '.'+domStrs[1], function() {
                    that.closeLayer();
                    return false;
                });
            }
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
     * 为input输入框添加清除按钮、显示密码按钮等
     * 
     * 调用方式：
     *    $('input').ajInputOprateIcon({
     *        className: 'class' //自定义class名称
     *    });
     * 
     * ===================================================================**/

    (function(){
        var _domStrs = ['ajic-wraper','ajic-delIcon', 'ajic-togglePassIcon', 'ajic-delIconWraper', 'ajic-PassIconWraper'];
        
        $.fn.ajInputOprateIcon = function(options){

            var _timeoutId;
            var _settings = $.extend({}, $.fn.ajInputOprateIcon.defaults, options);

            $win.on('resize.ajInputOprateIcon', function(){
                $(this).ajInputOprateIcon();
            });
            //过滤掉非内容输入框的input
            return this.filter('input')
                .each(function(){
                    var _$passIcon;

                    var _$this     = $(this);
                    var _$wraper   = $('<div class="'+_domStrs[0]+' '+ (_settings.className||'')+'"></div>');
                    var _$delIcon  = $('<span class='+_domStrs[3]+'><i class="fa fa-times"></i></span>');
                    var _display   = _$this.css('_display') || 'inline-block';
                    var _height    = _$this.height() || '100px';
                    var _type      = _$this.attr('type');
                    var _iconWidth = _height*3/5;
                    _$wraper.css({
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
        $.fn.ajInputOprateIcon.defaults = {};

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
     *  调用方式
     *      $('.aj-slideContainer').ajSlider(options);
     *
     *   options：{
            animSpeed: 300,    // 滑动速度
            pauseTime: 3000,   // 滑动间隔
            autoplay: false,   // 是否自动播放
            pagination:true,   // 是否显示分页信息
            column: 1,         // 每屏幕显示几列
            loop:true          // 是否循环
     *   }
     *
     * 
     * ===================================================================**/
    (function(){
        var domStrs = ['aj-slideContainer', 'aj-slideWraper', 'aj-slide'];

        var AjSlider = function(element, settings){
            var $cloneSlide, $pagination;
            var _this          = this;
            var $element       = $(element);
            var $slideWraper   = $element.find('.'+domStrs[1]);
            var $slides        = $slideWraper.find('.'+domStrs[2]);
            var $initialSlides = $slides.clone();
            var slideCount     = $slides.length;
            var indexlength    = slideCount - 1;
            var wraperWidth    = $element.width();
            var column         = settings.column || 1;
            var slideWidth     = Math.ceil( wraperWidth / column );
            var delay          = settings.pauseTime || 3000;
            var loop           = settings.loop;
            var speed          = settings.animSpeed;
            var pagination     = settings.pagination;
            var i              = 0;

            if(loop){ 
                for(; i < column ; i++ ){
                    $cloneSlide = $( $initialSlides[i] ).clone();
                    $slideWraper.append($cloneSlide);

                    $cloneSlide = $( $initialSlides[indexlength - i] ).clone();
                    $slideWraper.prepend($cloneSlide);
                    slideCount += 2;
                }
            }

            if(pagination){
                $pagination = $('<ul class="aj-slidePgWraper"></ul>');
                for( i = 0 ; i < indexlength + 1 ; i++){
                    $pagination.append('<li data-index='+i+'></li>');
                }
                $element.append( $pagination );
            }

            $pagination.on('tap', function(e){
                var index = $(e.target).data('index');
                _this.slideTo(index + column);
            });

            //初始化数据
            this.settings        = settings || {};
            this.slideWidth      = slideWidth;
            this.slideWraper     = $slideWraper;
            this.containter      = $element;
            this.currentIndex    = settings.settings || 0; 
            this.touches         = {};
            this.autoPlayTimerId = '';
            this.toucheStartTime = '';
            this.pagination      = $pagination;
            
            $slideWraper.css({
                width: slideWidth * slideCount
            });

            this.silentSlideTo(column);

            $slideWraper.on('touchstart', function(e){
                _this.onTouchStart.call(_this,e);
            });

            $slideWraper.on('touchmove', function(e){
                _this.onTouchMove.call(_this,e);
            });

            $slideWraper.on('touchend', function(e){
                _this.onTouchEnd.call(_this,e);
            });
        };

        var spt = AjSlider.prototype;

        spt.slideTo = function(index){
            var $pagination, targetLi;
            var _this      = this;
            var length     = this.slideWraper.find('.'+domStrs[2]).length;
            var loop       = this.settings.loop;
            var column     = this.settings.column;
            var pagination = this.settings.pagination;
            var translateX = -(index * this.slideWidth);
            var speed      = this.settings.animSpeed || 500;

            if(isUndefined(index) || index<0){
                index = 0;
            } 
            if(index > (length-1)){
                index = length-1;
            } 

            this.currentIndex = index;

            if (this.support.transforms3d){
                this.slideWraper.transform('translate3d(' + translateX + 'px, 0px, 0px)');  
            } else {
                this.slideWraper.transform('translate(' + translateX + 'px, 0px)');
            } 

            if(loop){
                if( (length - column) === index ){
                    _this.slideWraper.transitionEnd(function(){
                        console.log(column);
                        _this.silentSlideTo(column);
                    });
                } 
                if( 0 === index ){
                    _this.slideWraper.transitionEnd(function(){
                        _this.silentSlideTo(length - 2 * column);
                    });
                }
            }

            if(pagination){
                $pagination = _this.pagination;
                targetLi = $pagination.find('li')[_this.currentIndex - column];
                $(targetLi).addClass('active').siblings().removeClass('active');
            }

        };

        spt.silentSlideTo = function(index){
            var speed = this.settings.animSpeed || 500;
            var _this = this;
            _this.slideWraper.transition(0);
            _this.slideTo(index);
            setTimeout(function(){
                _this.slideWraper.transition(speed);
            }, 100);
        };

        spt.autoplay = function(){
            var index;
            var _this    = this;
            var settings = _this.settings;
            var pausing  = _this.pausing;
            var length   = _this.slideWraper.find('.'+domStrs[2]).length;
            var delay    = settings.pauseTime;
            var duration = settings.duration;
            var loop     = settings.loop;
            var speed    = settings.animSpeed || 500;
            var column   = this.settings.column;

            if(!pausing){
                index = _this.currentIndex + 1;
                _this.slideTo(index);
                if((length - 1) === index){
                    if(!loop){
                        return false;
                    } else {
                        _this.slideWraper.transitionEnd(function(){
                            _this.silentSlideTo(column);
                        });
                    }
                }
                _this.slideWraper.transitionEnd(function(){
                    clearTimeout(_this.autoPlayTimerId);
                    _this.autoPlayTimerId = setTimeout(function(){
                        _this.slideWraper.transition(speed);
                        _this.autoplay();
                    }, delay);
                });
            } else {
                clearTimeout(_this.autoPlayTimerId);
                _this.autoPlayTimerId = setTimeout(function(){
                    _this.slideWraper.transition(speed);
                    _this.autoplay();
                }, delay);
            }
        };

        spt.onTouchStart = function(e){
            var _this = this;
            _this.pausing = true;

            _this.touches.startX  = _this.touches.currentX = e.touches[0].pageX;
            _this.wraperTranslateX = this.getTranslateX( this.slideWraper[0] );
            _this.toucheStartTime = Date.now();
            _this.slideWraper.transition(0);
        };

        spt.onTouchMove = function(e){
            var wraperTranslateX,
                currentTranslate;

            var diff           = 0;
            var startTranslate = 0;

            e.stopPropagation();
            e.preventDefault();

            this.touches.currentX = e.touches[0].pageX;

            
            diff = this.touches.currentX - this.touches.startX;
            currentTranslate = this.wraperTranslateX + diff;
            if(this.support.transforms3d){
                this.slideWraper.transform('translate3d(' + currentTranslate + 'px, 0px, 0px)');  
            } else {
                this.slideWraper.transform('translate(' + currentTranslate + 'px, 0px)');
            }
        };

        spt.onTouchEnd = function(e){
            var nowTime = Date.now();
            var slideToIndex = 0 ;
            var speed        = this.settings.animSpeed;
            var diff         = this.touches.currentX - this.touches.startX;
            var absDiff      = Math.abs(diff);
            var slideWidth   = this.slideWidth;

            this.pausing = false;
            this.slideWraper.transition( speed );

            if( ((absDiff < slideWidth/3) && 
                (nowTime - this.toucheStartTime) > 200 || absDiff < 10 )){
                slideToIndex = this.currentIndex;
            } else if( diff < 0 ){
                slideToIndex = ++this.currentIndex;
            } else {
                slideToIndex = --this.currentIndex;
            }
            this.slideWraper.transition(200);
            this.slideTo( slideToIndex );
        };

        spt.getTranslateX = function (el) {
            var matrix, curTransform, curStyle, transformMatrix;

            curStyle = window.getComputedStyle(el, null);
            if (window.WebKitCSSMatrix) {
                curTransform = curStyle.transform || curStyle.webkitTransform;
                if (curTransform.split(',').length > 6) {
                    curTransform = curTransform.split(', ').map(function(a){
                        return a.replace(',','.');
                    }).join(', ');
                }
                // Some old versions of Webkit choke when 'none' is passed; pass
                // empty string instead in this case
                transformMatrix = new window.WebKitCSSMatrix(curTransform === 'none' ? '' : curTransform);
            }
            else {
                transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform  || curStyle.transform || curStyle.getPropertyValue('transform').replace('translate(', 'matrix(1, 0, 0, 1,');
                matrix = transformMatrix.toString().split(',');
            }
        
            if (window.WebKitCSSMatrix){
                curTransform = transformMatrix.m41;
            } else {
                curTransform = parseFloat(matrix[4]);
            }

            return curTransform || 0;
        };

        spt.support = {
            transforms3d : (window.Modernizr && Modernizr.csstransforms3d === true) || (function () {
                var div = document.createElement('div').style;
                return ('webkitPerspective' in div || 'MozPerspective' in div || 'OPerspective' in div || 'MsPerspective' in div || 'perspective' in div);
            })()
        };

        var initSlider = function(element, settings){
            var $element    = $(element);
            var delay       = settings.pauseTime;
            var autoplay    = settings.autoplay;

            var ajSliderEle = new AjSlider($element, settings);
            if(autoplay){
                ajSliderEle.autoPlayTimerId = setTimeout(function(){
                    ajSliderEle.autoplay();
                }, delay);
            }

            return ajSliderEle;
        };
        
        $.fn.ajSlider = function(options){
            var settings = $.extend({}, $.fn.ajSlider.defaults, options);
            var column   = settings.column;

            return this.each(function(index,element){
                var $element    = $(element);
                var ajSliderEle = initSlider($element, settings);
                $win.on('resize.ajSlider', function(){
                    clearTimeout(ajSliderEle.autoPlayTimerId);
                    ajSliderEle.silentSlideTo(column);
                    ajSliderEle = initSlider($element, settings);
                });
            });
        };

        //Default settings
        $.fn.ajSlider.defaults = {
            startSlide:0, 
            animSpeed: 500,
            pauseTime: 3000,
            autoplay: false,
            pagination:true,
            column: 1,
            loop:true
        };
    })();
    
    return {
        layer: layer
    };

})(Zepto);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJ0Z3VpX21vYmlsZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogVEdVSV9NT0JJTEUgdjEuMC4wXHJcbiAqXHJcbiAqIGRlcGVuZGVuY2llczogXHJcbiAqICAgWmVwdG86IFt0b3VjaCwgc2VsZWN0b3IsIGRhdGEsIENhbGxiYWNrLCBkZWZmZXJkXVxyXG4gKiAgIGZvbnRBd2Vzb21lXHJcbiAqXHJcbiAqIGNzczpcclxuICogICAgIFtmb250LWF3ZXNvbWUuY3NzLCB0Z3VpX21vYmlsZS5jc3NdXHJcbiAqXHJcbiAqIOiuvuiuoeeov+S4uu+8mjc1MHB4XHJcbiAqXHJcbiAqIGF1Y2hvciA6IGVjaG9cclxuICogXHJcbiAqIExpY2Vuc2VkIHVuZGVyIE1JVFxyXG4gKiBSZWxlYXNlZCBvbjogTWFyIDI1LCAyMDE2XHJcbiAqIFxyXG4gKi9cclxuXHJcbndpbmRvdy5UR1VJTW9iaWxlICA9IChmdW5jdGlvbigkKXtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICB2YXIgZG9jID0gZG9jdW1lbnQsXHJcbiAgICAgICAgJHdpbiA9ICQod2luZG93KSxcclxuICAgICAgICBkb2NFbCA9IGRvYy5kb2N1bWVudEVsZW1lbnQ7XHJcblxyXG4gICAgdmFyIGlzVW5kZWZpbmVkID0gZnVuY3Rpb24ocGFyYW0pe1xyXG4gICAgICAgIHJldHVybiAodHlwZW9mIHBhcmFtID09PSAndW5kZWZpbmVkJyk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8v5Yqo5oCB5Yqg6L29Y3Nz44CBanPmlofku7ZcclxuICAgIHZhciByZXF1aXJlID0gZnVuY3Rpb24obW9kdWxlU3JjKXtcclxuICAgICAgICB2YXIgaSAgICAgICAgICA9IDA7XHJcbiAgICAgICAgdmFyIGhlYWQgICAgICAgPSAkKCdoZWFkJylbMF07XHJcbiAgICAgICAgdmFyIG1vZHVsZSAgICAgPSBtb2R1bGVTcmMucmVwbGFjZSgvXFxzL2csICcnKTtcclxuICAgICAgICB2YXIgaXNjc3MgICAgICA9IC9cXC5jc3MkLy50ZXN0KG1vZHVsZSk7XHJcbiAgICAgICAgdmFyIG5vZGUgICAgICAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGlzY3NzID8gJ2xpbmsnIDogJ3NjcmlwdCcpO1xyXG4gICAgICAgIHZhciBwYXRoICAgICAgID0gZG9jdW1lbnQuY3VycmVudFNjcmlwdC5zcmM7XHJcbiAgICAgICAgdmFyIG1vZHVsZVBhdGggPSBwYXRoLnJlcGxhY2UoL2pzXFwvXFx3K1xcLmpzJC8sbW9kdWxlKTtcclxuICAgICAgICB2YXIgdGFyZ2V0VGFnO1xyXG5cclxuICAgICAgICAvL+eUn+aIkGlkXHJcbiAgICAgICAgdmFyIGlkID0gbW9kdWxlLnJlcGxhY2UoL1xcLnxcXC98XFw6L2csICcnKTtcclxuICAgICAgICBpZihpc2Nzcyl7XHJcbiAgICAgICAgICAgIG5vZGUucmVsID0gJ3N0eWxlc2hlZXQnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBub2RlW2lzY3NzPydocmVmJzonc3JjJ10gPSAvXmh0dHA6XFwvXFwvLy50ZXN0KG1vZHVsZSkgPyBtb2R1bGUgOiBtb2R1bGVQYXRoO1xyXG4gICAgICAgIG5vZGUuaWQgPSBpZDtcclxuICAgICAgICBpZighJCgnIycraWQpLmxlbmd0aCl7XHJcbiAgICAgICAgICAgIGlmKGlzY3NzKXtcclxuICAgICAgICAgICAgICAgIHRhcmdldFRhZyA9IGhlYWQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2xpbmsnKVswXTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRhcmdldFRhZyA9IGRvY3VtZW50LmN1cnJlbnRTY3JpcHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaGVhZC5pbnNlcnRCZWZvcmUobm9kZSwgdGFyZ2V0VGFnKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8v6YCa55So5Yqo55S75pa55rOVXHJcbiAgICAkLmZuLnRyYW5zZm9ybSA9IGZ1bmN0aW9uICh0cmFuc2Zvcm0pIHtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIGVsU3R5bGUgPSB0aGlzW2ldLnN0eWxlO1xyXG4gICAgICAgICAgICBlbFN0eWxlLndlYmtpdFRyYW5zZm9ybSA9IGVsU3R5bGUuTXNUcmFuc2Zvcm0gPSBlbFN0eWxlLm1zVHJhbnNmb3JtID0gZWxTdHlsZS5Nb3pUcmFuc2Zvcm0gPSBlbFN0eWxlLk9UcmFuc2Zvcm0gPSBlbFN0eWxlLnRyYW5zZm9ybSA9IHRyYW5zZm9ybTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG5cclxuICAgICQuZm4udHJhbnNpdGlvbiA9IGZ1bmN0aW9uIChkdXJhdGlvbikge1xyXG4gICAgICAgIGlmICh0eXBlb2YgZHVyYXRpb24gIT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIGR1cmF0aW9uID0gZHVyYXRpb24gKyAnbXMnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIGVsU3R5bGUgPSB0aGlzW2ldLnN0eWxlO1xyXG4gICAgICAgICAgICBlbFN0eWxlLndlYmtpdFRyYW5zaXRpb25EdXJhdGlvbiA9IGVsU3R5bGUuTXNUcmFuc2l0aW9uRHVyYXRpb24gPSBlbFN0eWxlLm1zVHJhbnNpdGlvbkR1cmF0aW9uID0gZWxTdHlsZS5Nb3pUcmFuc2l0aW9uRHVyYXRpb24gPSBlbFN0eWxlLk9UcmFuc2l0aW9uRHVyYXRpb24gPSBlbFN0eWxlLnRyYW5zaXRpb25EdXJhdGlvbiA9IGR1cmF0aW9uO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcblxyXG4gICAgJC5mbi50cmFuc2l0aW9uRW5kID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgdmFyIGV2ZW50cyA9IFsnd2Via2l0VHJhbnNpdGlvbkVuZCcsICd0cmFuc2l0aW9uZW5kJywgJ29UcmFuc2l0aW9uRW5kJywgJ01TVHJhbnNpdGlvbkVuZCcsICdtc1RyYW5zaXRpb25FbmQnXSxcclxuICAgICAgICAgICAgaSwgaiwgZG9tID0gdGhpcztcclxuICAgICAgICBmdW5jdGlvbiBmaXJlQ2FsbEJhY2soZSkge1xyXG4gICAgICAgICAgICBpZiAoZS50YXJnZXQgIT09IHRoaXMpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjsgXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzLCBlKTtcclxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGV2ZW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgZG9tLm9mZihldmVudHNbaV0sIGZpcmVDYWxsQmFjayk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBldmVudHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGRvbS5vbihldmVudHNbaV0sIGZpcmVDYWxsQmFjayk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIHJlcXVpcmUoJ2Nzcy90Z3VpX21vYmlsZS5taW4uY3NzJyk7XHJcbiAgICAvLyByZXF1aXJlKCdjc3MvZm9udC1hd2Vzb21lLm1pbi5jc3MnKTtcclxuICAgIFxyXG4gICAgLyoqPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAgICAqIFxyXG4gICAgICog5by55Ye65qGGXHJcbiAgICAgKlxyXG4gICAgICogIOiwg+eUqOaWueW8j++8mmxheUluZGV4ID0gVEdVSU1vYmlsZS5sYXllci5vcGVuKG9wdGlvbnMpXHJcbiAgICAgKlxyXG4gICAgICogIG9wdGlvbnMgLT4ganNvblxyXG4gICAgICAgICAgIHRpdGxl77yaJ+agh+mimCcsXHJcbiAgICAgICAgICAgY2xhc3NOYW1lOiAnJyxcclxuICAgICAgICAgICBzaGFkZe+8mnRydWV8fGZhbHNlLCAvL+aYr+WQpuaYvuekuumBrue9qeWxglxyXG4gICAgICAgICAgIGNsb3NlSWNvbjogdHJ1ZSB8fCBmYWxzZVxyXG4gICAgICAgICAgIGJ1dHRvbjp7XHJcbiAgICAgICAgICAgICAgIFwic2hvd0J0blwiOnRydWUsICBcclxuICAgICAgICAgICAgICAgXCJidG5zXCI6W3svL2J0buaVsOe7hFxyXG4gICAgICAgICAgICAgICAgICAgIFwidmFsdWVTdHJcIjpidG7mmL7npLrlhoXlrrksXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjYWxsYmFja1wiOiBmdW5jdGlvbiwgLy/ngrnlh7vor6XmjInpkq7nmoTlm57osIPmlrnms5XvvIzpu5jorqTkuLpsYXllckNsb3NlXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjbGFzc05hbWVcIjpidG4gY2xhc3NOYW1lXHJcbiAgICAgICAgICAgICAgICB9XSAgXHJcbiAgICAgICAgICAgfVxyXG4gICAgICAgICAgIFwicG9zaXRpb25cIjogW2xlZnR8fHJpZ2h0fHxjZW50ZXIsdG9wfHxib3R0b218fGNlbnRlcl0sIC8vIOS9jee9rlxyXG4gICAgICAgICAgIFwiY29udGVudFwiOlwiaHRtbC1zdHJcIiwgLy/lhoXlrrlcclxuICAgICAgXHJcbiAgICAgICAg5YWz6ZetOlxyXG4gICAgICAgICAgICBUR1VJTW9iaWxlLmxheWVyLmNsb3NlKGxheUluZGV4KVxyXG4gICAgICBcclxuICAgICAgIGVnOlxyXG4gICAgICAgIHZhciBsYXllciA9IHdpbmRvdy5UR1VJTW9iaWxlLmxheWVyLm9wZW4oe1xyXG4gICAgICAgICAgICB0aXRsZTogJ+a1i+ivlScsXHJcbiAgICAgICAgICAgIHNoYWRlOnRydWUsXHJcbiAgICAgICAgICAgIGJ1dHRvbjp7XHJcbiAgICAgICAgICAgICAgICBcInNob3dCdG5cIjp0cnVlLFxyXG4gICAgICAgICAgICAgICAgJ2J0bnMnOlt7XHJcbiAgICAgICAgICAgICAgICAgICAgJ3ZhbHVlU3RyJzon5Y+W5raIJyxcclxuICAgICAgICAgICAgICAgICAgICAnY2xhc3NOYW1lJzonYWpseS1idG4tdHJhbnMnXHJcbiAgICAgICAgICAgICAgICB9LHtcclxuICAgICAgICAgICAgICAgICAgICAndmFsdWVTdHInOifpqazkuIrkuIvovb0nXHJcbiAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBjb250ZW50OidvaCBzaGl0J1xyXG4gICAgICAgIH0pO1xyXG4gICAgICBcclxuICAgICAgICBmdW5jdGlvbiBjYW5jZWxDYWxsYmFjayhsYXllcil7XHJcbiAgICAgICAgICAgIHdpbmRvdy5UR1VJTW9iaWxlLmxheWVyLmNsb3NlKGxheWVyKVxyXG4gICAgICAgIH1cclxuICAgICAqICAgICAgXHJcbiAgICAgKj09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0qKi9cclxuICAgIHZhciBsYXllciA9IChmdW5jdGlvbigpe1xyXG5cclxuICAgICAgICAvL+i3r+W+hOaUueWPmO+8jOatpOWkhOS7o+eggemcgOimgeS/ruaUuVxyXG4gICAgICAgIC8qdmFyIGdldFVJQ1NTID0gZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdmFyIGpzU3JjID0gZG9jdW1lbnQuY3VycmVudFNjcmlwdC5zcmM7XHJcbiAgICAgICAgICAgIHZhciBjc3NTcmMgPSBqc1NyYy5yZXBsYWNlKC9cXC9qc1xcLy8sICdcXC9jc3NcXC8nKS5yZXBsYWNlKC9cXC5qcy8sICdcXC5jc3MnKTtcclxuICAgICAgICAgICAgcmV0dXJuIGNzc1NyYztcclxuICAgICAgICB9O1xyXG4gICAgICAgIHJlcXVpcmUoZ2V0VUlDU1MoKSk7Ki9cclxuXHJcbiAgICAgICAgdmFyIGRlZmF1bHRzID0ge1xyXG4gICAgICAgICAgICAgICAgJ3dpZHRoJzogJzY0MHB4JyxcclxuICAgICAgICAgICAgICAgIFwiYnV0dG9uXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInNob3dCdG5cIjogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwic2hhZGVcIjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICdkcmFnYWJsZSc6ZmFsc2VcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgLy/llK/kuIDmoIfnpLpcclxuICAgICAgICAgICAgbGF5SW5kZXggPSAwLFxyXG5cclxuICAgICAgICAgICAgZG9tU3RycyA9IFsnYWpseS13cmFwZXInLCAnYWpseS1jbG9zZScsJ2FqbHktdGl0bGUnLCAnYWpseS1tYWluJywnYWpseS1mb290ZXInLCAnYWpseS1idG4nLCdhamx5LWh0bWwnXTtcclxuXHJcbiAgICAgICAgdmFyIExheWVyQ2xhc3MgPSBmdW5jdGlvbihvcHRpb25zKXtcclxuXHJcbiAgICAgICAgICAgIHZhciBfID0gdGhpcztcclxuICAgICAgICAgICAgXy5sYXlJbmRleCA9ICsrbGF5SW5kZXg7XHJcbiAgICAgICAgICAgIF8uc2V0dGluZ3MgPSAkLmV4dGVuZCh7fSwgZGVmYXVsdHMsIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICBfLmluaXQoKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgbHB0ID0gTGF5ZXJDbGFzcy5wcm90b3R5cGU7XHJcblxyXG4gICAgICAgIGxwdC5pbml0ID0gZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG5cclxuICAgICAgICAgICAgLy/liJvlu7rmqKHmnb9cclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVWZXNzZWwoKTtcclxuXHJcbiAgICAgICAgICAgIC8v5Yid5aeL5YyW5oyJ6ZKuXHJcbiAgICAgICAgICAgIHRoaXMuaW5pdExheWVyQnRucygpO1xyXG5cclxuICAgICAgICAgICAgLy/lrr3pq5jlkozkvY3nva5cclxuICAgICAgICAgICAgdGhpcy5sYXllck9mZnNldCgpO1xyXG5cclxuICAgICAgICAgICAgJHdpbi5vbihcInJlc2l6ZS5cIit0aGlzLmxheUluZGV4LCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQubGF5ZXJPZmZzZXQoKTtcclxuICAgICAgICAgICAgfSwgZmFsc2UpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxwdC5jcmVhdGVWZXNzZWwgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBzZXR0aW5ncyA9IHRoaXMuc2V0dGluZ3M7XHJcblxyXG4gICAgICAgICAgICB2YXIgc2hhZGUgICAgID0gISEoc2V0dGluZ3Muc2hhZGUpO1xyXG4gICAgICAgICAgICB2YXIgY2xvc2VJY29uID0gISEoc2V0dGluZ3MuY2xvc2VJY29uKTtcclxuICAgICAgICAgICAgdmFyIGNsYXNzTmFtZSA9IHNldHRpbmdzLmNsYXNzTmFtZSB8fCAnJztcclxuXHJcbiAgICAgICAgICAgIHZhciBsYXllckh0bWxUbXBsID0gWyc8ZGl2IGNsYXNzPVwiJytkb21TdHJzWzBdKyBcIiBcIiArY2xhc3NOYW1lKydcIiBpZD1cIicgKyBkb21TdHJzWzBdICsgdGhpcy5sYXlJbmRleCArICdcIj4nLFxyXG4gICAgICAgICAgICAgICAgc2hhZGUgPyAnPGRpdiBjbGFzcz1cImFqbHktbWFza1wiPjwvZGl2PicgOiAnJyxcclxuICAgICAgICAgICAgICAgICcgICA8ZGl2IGNsYXNzPScrZG9tU3Ryc1szXSsnPicsXHJcbiAgICAgICAgICAgICAgICAnICAgICAgIDxkaXYgY2xhc3M9XCJhamx5LWhlYWRlclwiPicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZUljb24/JzxpIGNsYXNzPScrZG9tU3Ryc1sxXSsnPsOXPC9pPic6JycsXHJcbiAgICAgICAgICAgICAgICAnICAgICAgICAgICA8ZGl2IGNsYXNzPScrZG9tU3Ryc1syXSsnPicgKyAoc2V0dGluZ3MudGl0bGUgPyBzZXR0aW5ncy50aXRsZSA6ICcnKSArICc8L2Rpdj4nLFxyXG4gICAgICAgICAgICAgICAgJyAgICAgICA8L2Rpdj4nLFxyXG4gICAgICAgICAgICAgICAgJyAgICAgICA8ZGl2IGNsYXNzPVwiYWpseS1jb250ZW50XCI+JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzLmNvbnRlbnQgPyBzZXR0aW5ncy5jb250ZW50IDogXCJcIixcclxuICAgICAgICAgICAgICAgICcgICAgICAgPC9kaXY+JyxcclxuICAgICAgICAgICAgICAgICcgICAgICAgPGRpdiBjbGFzcz0nK2RvbVN0cnNbNF0rJyAgaWQ9Jytkb21TdHJzWzRdKyc+JyxcclxuICAgICAgICAgICAgICAgICcgICAgICAgPC9kaXY+JyxcclxuICAgICAgICAgICAgICAgICcgICA8L2Rpdj4nLFxyXG4gICAgICAgICAgICAgICAgJzwvZGl2PidcclxuICAgICAgICAgICAgXS5qb2luKFwiXCIpO1xyXG5cclxuICAgICAgICAgICAgaWYoc2hhZGUpe1xyXG4gICAgICAgICAgICAgICAgICQoZG9jRWwpLmFkZENsYXNzKGRvbVN0cnNbNl0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLiRsYXllckZyYWdtZW50ID0gJChsYXllckh0bWxUbXBsKTtcclxuXHJcbiAgICAgICAgICAgIGlmKGNsb3NlSWNvbil7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRsYXllckZyYWdtZW50Lm9uKCd0YXAnLCAnLicrZG9tU3Ryc1sxXSwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5jbG9zZUxheWVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvL+WIneWni+WMluaMiemSrlxyXG4gICAgICAgIGxwdC5pbml0TGF5ZXJCdG5zID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciBidG5FbGVtZW50LCAkYnRuRWxlbWVudDtcclxuICAgICAgICAgICAgdmFyIHRoYXQgICAgID0gdGhpcztcclxuICAgICAgICAgICAgdmFyIHNldHRpbmdzID0gdGhpcy5zZXR0aW5ncztcclxuICAgICAgICAgICAgdmFyIGJ1dHRvbiAgID0gc2V0dGluZ3MuYnV0dG9uIHx8IHt9O1xyXG4gICAgICAgICAgICB2YXIgYnRucyAgICAgPSBidXR0b24gJiYgYnV0dG9uLmJ0bnM7XHJcbiAgICAgICAgICAgIHZhciBidG5zTGVuICA9IChidG5zICYmIGJ0bnMubGVuZ3RoKSB8fCAwO1xyXG4gICAgICAgICAgICB2YXIgaSAgICAgICAgPSAwO1xyXG4gICAgICAgICAgICB2YXIgJGxheWVyICAgPSB0aGlzLiRsYXllckZyYWdtZW50O1xyXG5cclxuICAgICAgICAgICAgdmFyIGJ0bkNsb3NlTGF5ZXIgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgdGhhdC5jbG9zZUxheWVyKCk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvL+aYr+WQpuaYvuekuuaMiemSrlxyXG4gICAgICAgICAgICBpZiAoYnV0dG9uLnNob3dCdG4pIHtcclxuICAgICAgICAgICAgICAgIGlmIChidG5zTGVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICg7IGkgPCBidG5zTGVuOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnRuRWxlbWVudCA9IGJ0bnNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRidG5FbGVtZW50ID0gJCgnPGJ1dHRvbiBjbGFzcz1cIicgK2RvbVN0cnNbNV0gKycgJysgKGJ0bkVsZW1lbnQuY2xhc3NOYW1lfHwgJycpICsnXCI+JyArIGJ0bkVsZW1lbnQudmFsdWVTdHIgKyAnPC9idXR0b24+Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRidG5FbGVtZW50LnRhcChidG5FbGVtZW50LmNhbGxiYWNrIHx8IGJ0bkNsb3NlTGF5ZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkbGF5ZXIuZmluZChcIiNcIitkb21TdHJzWzRdKS5hcHBlbmQoJGJ0bkVsZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy/pu5jorqTmmL7npLrnoa7lrprmjInpkq5cclxuICAgICAgICAgICAgICAgICAgICAkYnRuRWxlbWVudCA9ICQoJzxidXR0b24gY2xhc3M9XCInKyBkb21TdHJzWzVdICsnXCI+56Gu5a6aPC9idXR0b24+Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJGJ0bkVsZW1lbnQudGFwKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuY2xvc2VMYXllcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICRsYXllci5maW5kKFwiI1wiK2RvbVN0cnNbNF0pLmFwcGVuZCgkYnRuRWxlbWVudCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8v5L2N572u5ZKM5a696auY6K6+572uXHJcbiAgICAgICAgbHB0LmxheWVyT2Zmc2V0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciB3aWR0aCxcclxuICAgICAgICAgICAgICAgIHhfYXJlYSx5X2FyZWEsXHJcbiAgICAgICAgICAgICAgICB4cG9zLCB5cG9zLHhwb3NrZXkseXBvc2tleTtcclxuICAgICAgICAgICAgdmFyIHNldHRpbmdzICAgICAgPSB0aGlzLnNldHRpbmdzO1xyXG4gICAgICAgICAgICB2YXIgJGxheWVyICAgICAgICA9IHRoaXMuJGxheWVyRnJhZ21lbnQ7XHJcbiAgICAgICAgICAgIHZhciB3aW5IZWlnaHQgICAgID0gJHdpbi5oZWlnaHQoKTtcclxuICAgICAgICAgICAgdmFyIHdpbldpZHRoICAgICAgPSAkd2luLndpZHRoKCk7XHJcbiAgICAgICAgICAgIHZhciBwb3NpdGlvblN0eWxlID0ge307XHJcbiAgICAgICAgICAgIHZhciBwb3NpdGlvbiAgICAgID0gc2V0dGluZ3MucG9zaXRpb24gfHwgW107XHJcbiAgICAgICAgICAgIHZhciAkYWpseU1haW4gICAgID0gJGxheWVyLmZpbmQoXCIuXCIrZG9tU3Ryc1szXSk7XHJcblxyXG4gICAgICAgICAgICB3aWR0aCA9IHNldHRpbmdzLndpZHRoO1xyXG4gICAgICAgICAgICAkYWpseU1haW4uY3NzKHtcclxuICAgICAgICAgICAgICAgIFwid2lkdGhcIjogd2lkdGgsXHJcbiAgICAgICAgICAgICAgICBcImhlaWdodFwiOiAnYXV0bydcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBpZighJCgnIycrZG9tU3Ryc1swXSArIHRoaXMubGF5SW5kZXgsIGRvYy5ib2R5KS5sZW5ndGgpe1xyXG4gICAgICAgICAgICAgICAgJChkb2MuYm9keSkuYXBwZW5kKCRsYXllcik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHhfYXJlYSA9IHBhcnNlSW50KCRhamx5TWFpbi53aWR0aCgpLCAxMCk7XHJcbiAgICAgICAgICAgIHlfYXJlYSA9IHBhcnNlSW50KCRhamx5TWFpbi5oZWlnaHQoKSwgMTApO1xyXG5cclxuICAgICAgICAgICAgaWYocG9zaXRpb25bMF0gJiYgKHBvc2l0aW9uWzBdID09PSAnbGVmdCcgfHwgcG9zaXRpb25bMF09PT0ncmlnaHQnKSl7XHJcbiAgICAgICAgICAgICAgICB4cG9zID0gMDtcclxuICAgICAgICAgICAgICAgIHhwb3NrZXkgPSBwb3NpdGlvblswXTtcclxuICAgICAgICAgICAgICAgIHBvc2l0aW9uU3R5bGVbeHBvc2tleV0gPSB4cG9zO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICB4cG9zID0gKHdpbldpZHRoIC0geF9hcmVhKSAvIDI7XHJcbiAgICAgICAgICAgICAgICB4cG9zID0gKHhwb3MgPiAwID8geHBvcyA6IDApO1xyXG4gICAgICAgICAgICAgICAgcG9zaXRpb25TdHlsZS5sZWZ0ID0geHBvcztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYocG9zaXRpb25bMV0gJiYgKHBvc2l0aW9uWzFdID09PSAndG9wJyB8fCBwb3NpdGlvblsxXSA9PT0gJ2JvdHRvbScpKXtcclxuICAgICAgICAgICAgICAgIHhwb3MgPSAwO1xyXG4gICAgICAgICAgICAgICAgeXBvc2tleSA9IHBvc2l0aW9uWzFdO1xyXG4gICAgICAgICAgICAgICAgcG9zaXRpb25TdHlsZVt5cG9za2V5XSA9IHhwb3M7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgICAgIHlwb3MgPSAod2luSGVpZ2h0IC0geV9hcmVhKSAvIDI7XHJcbiAgICAgICAgICAgICAgICB5cG9zID0gKHlwb3MgPiAwID8geXBvcyA6IDApO1xyXG4gICAgICAgICAgICAgICAgcG9zaXRpb25TdHlsZS50b3AgPSB5cG9zO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAkYWpseU1haW4uY3NzKHBvc2l0aW9uU3R5bGUpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8v5YWz6ZetXHJcbiAgICAgICAgbHB0LmNsb3NlTGF5ZXIgPSBmdW5jdGlvbihsYXllcklkKSB7XHJcblxyXG4gICAgICAgICAgICBsYXllcklkID0gZG9tU3Ryc1swXSArIChsYXllcklkIHx8IHRoaXMubGF5SW5kZXgpO1xyXG4gICAgICAgICAgICAkKGRvY0VsKS5yZW1vdmVDbGFzcyhkb21TdHJzWzZdKTtcclxuICAgICAgICAgICAgJHdpbi5vZmYoXCJyZXNpemUuXCIrdGhpcy5sYXlJbmRleCk7XHJcbiAgICAgICAgICAgICQoXCIjXCIgKyBsYXllcklkKS5yZW1vdmUoKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgbGF5ZXIgPSB7XHJcbiAgICAgICAgICAgIHZlcnRpb246ICcxLjAnLFxyXG4gICAgICAgICAgICBvcGVuOmZ1bmN0aW9uKG9wdGlvbnMpe1xyXG4gICAgICAgICAgICAgICAgdmFyIGxheWVyID0gbmV3IExheWVyQ2xhc3Mob3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbGF5ZXIubGF5SW5kZXg7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGNsb3NlOmZ1bmN0aW9uKGxheWVySW5kZXgpe1xyXG4gICAgICAgICAgICAgICAgbHB0LmNsb3NlTGF5ZXIobGF5ZXJJbmRleCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGxheWVyO1xyXG4gICAgfSkoKTtcclxuXHJcblxyXG4gICAgLyoqPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgICAgKiDkuLppbnB1dOi+k+WFpeahhua3u+WKoOa4hemZpOaMiemSruOAgeaYvuekuuWvhueggeaMiemSruetiVxyXG4gICAgICogXHJcbiAgICAgKiDosIPnlKjmlrnlvI/vvJpcclxuICAgICAqICAgICQoJ2lucHV0JykuYWpJbnB1dE9wcmF0ZUljb24oe1xyXG4gICAgICogICAgICAgIGNsYXNzTmFtZTogJ2NsYXNzJyAvL+iHquWumuS5iWNsYXNz5ZCN56ewXHJcbiAgICAgKiAgICB9KTtcclxuICAgICAqIFxyXG4gICAgICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSoqL1xyXG5cclxuICAgIChmdW5jdGlvbigpe1xyXG4gICAgICAgIHZhciBfZG9tU3RycyA9IFsnYWppYy13cmFwZXInLCdhamljLWRlbEljb24nLCAnYWppYy10b2dnbGVQYXNzSWNvbicsICdhamljLWRlbEljb25XcmFwZXInLCAnYWppYy1QYXNzSWNvbldyYXBlciddO1xyXG4gICAgICAgIFxyXG4gICAgICAgICQuZm4uYWpJbnB1dE9wcmF0ZUljb24gPSBmdW5jdGlvbihvcHRpb25zKXtcclxuXHJcbiAgICAgICAgICAgIHZhciBfdGltZW91dElkO1xyXG4gICAgICAgICAgICB2YXIgX3NldHRpbmdzID0gJC5leHRlbmQoe30sICQuZm4uYWpJbnB1dE9wcmF0ZUljb24uZGVmYXVsdHMsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgICAgICAgJHdpbi5vbigncmVzaXplLmFqSW5wdXRPcHJhdGVJY29uJywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICQodGhpcykuYWpJbnB1dE9wcmF0ZUljb24oKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIC8v6L+H5ruk5o6J6Z2e5YaF5a656L6T5YWl5qGG55qEaW5wdXRcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmlsdGVyKCdpbnB1dCcpXHJcbiAgICAgICAgICAgICAgICAuZWFjaChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBfJHBhc3NJY29uO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgXyR0aGlzICAgICA9ICQodGhpcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIF8kd3JhcGVyICAgPSAkKCc8ZGl2IGNsYXNzPVwiJytfZG9tU3Ryc1swXSsnICcrIChfc2V0dGluZ3MuY2xhc3NOYW1lfHwnJykrJ1wiPjwvZGl2PicpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBfJGRlbEljb24gID0gJCgnPHNwYW4gY2xhc3M9JytfZG9tU3Ryc1szXSsnPjxpIGNsYXNzPVwiZmEgZmEtdGltZXNcIj48L2k+PC9zcGFuPicpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBfZGlzcGxheSAgID0gXyR0aGlzLmNzcygnX2Rpc3BsYXknKSB8fCAnaW5saW5lLWJsb2NrJztcclxuICAgICAgICAgICAgICAgICAgICB2YXIgX2hlaWdodCAgICA9IF8kdGhpcy5oZWlnaHQoKSB8fCAnMTAwcHgnO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBfdHlwZSAgICAgID0gXyR0aGlzLmF0dHIoJ3R5cGUnKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgX2ljb25XaWR0aCA9IF9oZWlnaHQqMy81O1xyXG4gICAgICAgICAgICAgICAgICAgIF8kd3JhcGVyLmNzcyh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6X2Rpc3BsYXlcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgXyRkZWxJY29uLmNzcyh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDpfaGVpZ2h0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDpfaWNvbldpZHRoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnbGluZS1oZWlnaHQnOiBfaGVpZ2h0KydweCdcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgXyR0aGlzLndyYXAoXyR3cmFwZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIF8kd3JhcGVyLmFwcGVuZChfJGRlbEljb24pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZihfdHlwZSA9PT0gJ3Bhc3N3b3JkJyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF8kcGFzc0ljb24gPSAkKCc8c3BhbiBjbGFzcz0nK19kb21TdHJzWzRdKyc+PGkgY2xhc3M9XCJmYSBmYS1leWVcIj48L2k+PC9zcGFuPicpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgXyRwYXNzSWNvbi5jc3Moe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0Ol9oZWlnaHQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDpfaWNvbldpZHRoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2xpbmUtaGVpZ2h0JzogX2hlaWdodCsncHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmlnaHQ6X2ljb25XaWR0aCsxMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF8kcGFzc0ljb24uY2xpY2soZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dChfdGltZW91dElkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgX2lucHV0VHlwZSA9IF8kdGhpcy5hdHRyKCd0eXBlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgXyR0b29nbGVJY29uID0gXyRwYXNzSWNvbi5maW5kKCdpJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihfaW5wdXRUeXBlID09PSAncGFzc3dvcmQnKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfJHRoaXMuYXR0cigndHlwZScsICd1cmwnKS5mb2N1cygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8kdG9vZ2xlSWNvbi5hZGRDbGFzcygnZmEtZXllLXNsYXNoJykucmVtb3ZlQ2xhc3MoJ2ZhLWV5ZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfJHRoaXMuYXR0cigndHlwZScsICdwYXNzd29yZCcpLmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXyR0b29nbGVJY29uLmFkZENsYXNzKCdmYS1leWUnKS5yZW1vdmVDbGFzcygnZmEtZXllLXNsYXNoJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBfJHdyYXBlci5hcHBlbmQoXyRwYXNzSWNvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF8kdGhpcy5kYXRhKF9kb21TdHJzWzJdLCBfJHBhc3NJY29uKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIF8kdGhpcy5kYXRhKF9kb21TdHJzWzBdLCBfJHdyYXBlcik7XHJcbiAgICAgICAgICAgICAgICAgICAgXyR0aGlzLmRhdGEoX2RvbVN0cnNbMV0sIF8kZGVsSWNvbik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIF8kZGVsSWNvbi5jbGljayhmdW5jdGlvbihldmVudCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dChfdGltZW91dElkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBfJHRoaXMudmFsKCcnKS5mb2N1cygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmhpZGUoKTsgIFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAub24oJ2ZvY3VzLm9wcmV0YUljb24ga2V5dXAnLCBzaG93SWNvbnMpXHJcbiAgICAgICAgICAgICAgICAub24oJ2JsdXIub3ByZXRhSWNvbicsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIF8kdGhpcyA9ICQodGhpcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgX3RpbWVvdXRJZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oZXZlbnQpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoaWRlSWNvbnMoZXZlbnQsIF8kdGhpcyk7IFxyXG4gICAgICAgICAgICAgICAgICAgIH0sMjAwKTsgICBcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNob3dJY29ucyhldmVudCl7XHJcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG5cclxuICAgICAgICAgICAgdmFyIF8kdGhpcyAgICAgPSAkKHRoaXMpO1xyXG4gICAgICAgICAgICB2YXIgX3ZhbHVlICAgICA9IF8kdGhpcy52YWwoKTtcclxuICAgICAgICAgICAgdmFyIF8kZGVsSWNvbiAgPSBfJHRoaXMuZGF0YShfZG9tU3Ryc1sxXSk7XHJcbiAgICAgICAgICAgIHZhciBfJHBhc3NJY29uID0gXyR0aGlzLmRhdGEoX2RvbVN0cnNbMl0pO1xyXG5cclxuICAgICAgICAgICAgLy/lpoLmnpzlgLzkuLrnqbrvvIzkuI3mmL7npLpkZWxJY29uXHJcbiAgICAgICAgICAgIGlmKCFfdmFsdWUpe1xyXG4gICAgICAgICAgICAgICAgXyRkZWxJY29uJiZfJGRlbEljb24uaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgXyRwYXNzSWNvbiYmXyRwYXNzSWNvbi5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIF8kZGVsSWNvbiYmXyRkZWxJY29uLnNob3coKTsgXHJcbiAgICAgICAgICAgIF8kcGFzc0ljb24mJl8kcGFzc0ljb24uc2hvdygpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGhpZGVJY29ucyhldmVudCwgdGFyZ2V0T2JqKXtcclxuICAgICAgICAgICAgdmFyIF8kdGhpcyAgICAgPSB0YXJnZXRPYmo7XHJcbiAgICAgICAgICAgIHZhciBfJGRlbEljb24gID0gXyR0aGlzLmRhdGEoX2RvbVN0cnNbMV0pO1xyXG4gICAgICAgICAgICB2YXIgXyRwYXNzSWNvbiA9IF8kdGhpcy5kYXRhKF9kb21TdHJzWzJdKTtcclxuXHJcbiAgICAgICAgICAgIF8kZGVsSWNvbiAmJiBfJGRlbEljb24uaGlkZSgpO1xyXG4gICAgICAgICAgICBfJHBhc3NJY29uICYmIF8kcGFzc0ljb24uaGlkZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9EZWZhdWx0IHNldHRpbmdzXHJcbiAgICAgICAgJC5mbi5haklucHV0T3ByYXRlSWNvbi5kZWZhdWx0cyA9IHt9O1xyXG5cclxuICAgIH0pKCk7XHJcblxyXG4gICAgLyoqPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgICAgKiDova7mkq1cclxuICAgICAqICBIVE1M55uu5b2V57uT5p6EXHJcbiAgICAgKiAgICA8ZGl2IGNsYXNzPVwiYWotc2xpZGVDb250YWluZXJcIj5cclxuICAgICAqICAgICAgIDxkaXYgY2xhc3M9XCJhai1zbGlkZVdyYXBlclwiPlxyXG4gICAgICogICAgICAgICAgIDxkaXYgY2xhc3M9XCJhai1zbGlkZVwiPjE8L2Rpdj5cclxuICAgICAqICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYWotc2xpZGVcIj4yPC9kaXY+XHJcbiAgICAgKiAgICAgICAgICAgPGRpdiBjbGFzcz1cImFqLXNsaWRlXCI+MzwvZGl2PlxyXG4gICAgICogICAgICAgICAgIDxkaXYgY2xhc3M9XCJhai1zbGlkZVwiPjQ8L2Rpdj5cclxuICAgICAqICAgICAgIDwvZGl2PlxyXG4gICAgICogICAgPC9kaXY+XHJcbiAgICAgKlxyXG4gICAgICogIOiwg+eUqOaWueW8j1xyXG4gICAgICogICAgICAkKCcuYWotc2xpZGVDb250YWluZXInKS5halNsaWRlcihvcHRpb25zKTtcclxuICAgICAqXHJcbiAgICAgKiAgIG9wdGlvbnPvvJp7XHJcbiAgICAgICAgICAgIGFuaW1TcGVlZDogMzAwLCAgICAvLyDmu5HliqjpgJ/luqZcclxuICAgICAgICAgICAgcGF1c2VUaW1lOiAzMDAwLCAgIC8vIOa7keWKqOmXtOmalFxyXG4gICAgICAgICAgICBhdXRvcGxheTogZmFsc2UsICAgLy8g5piv5ZCm6Ieq5Yqo5pKt5pS+XHJcbiAgICAgICAgICAgIHBhZ2luYXRpb246dHJ1ZSwgICAvLyDmmK/lkKbmmL7npLrliIbpobXkv6Hmga9cclxuICAgICAgICAgICAgY29sdW1uOiAxLCAgICAgICAgIC8vIOavj+Wxj+W5leaYvuekuuWHoOWIl1xyXG4gICAgICAgICAgICBsb29wOnRydWUgICAgICAgICAgLy8g5piv5ZCm5b6q546vXHJcbiAgICAgKiAgIH1cclxuICAgICAqXHJcbiAgICAgKiBcclxuICAgICAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0qKi9cclxuICAgIChmdW5jdGlvbigpe1xyXG4gICAgICAgIHZhciBkb21TdHJzID0gWydhai1zbGlkZUNvbnRhaW5lcicsICdhai1zbGlkZVdyYXBlcicsICdhai1zbGlkZSddO1xyXG5cclxuICAgICAgICB2YXIgQWpTbGlkZXIgPSBmdW5jdGlvbihlbGVtZW50LCBzZXR0aW5ncyl7XHJcbiAgICAgICAgICAgIHZhciAkY2xvbmVTbGlkZSwgJHBhZ2luYXRpb247XHJcbiAgICAgICAgICAgIHZhciBfdGhpcyAgICAgICAgICA9IHRoaXM7XHJcbiAgICAgICAgICAgIHZhciAkZWxlbWVudCAgICAgICA9ICQoZWxlbWVudCk7XHJcbiAgICAgICAgICAgIHZhciAkc2xpZGVXcmFwZXIgICA9ICRlbGVtZW50LmZpbmQoJy4nK2RvbVN0cnNbMV0pO1xyXG4gICAgICAgICAgICB2YXIgJHNsaWRlcyAgICAgICAgPSAkc2xpZGVXcmFwZXIuZmluZCgnLicrZG9tU3Ryc1syXSk7XHJcbiAgICAgICAgICAgIHZhciAkaW5pdGlhbFNsaWRlcyA9ICRzbGlkZXMuY2xvbmUoKTtcclxuICAgICAgICAgICAgdmFyIHNsaWRlQ291bnQgICAgID0gJHNsaWRlcy5sZW5ndGg7XHJcbiAgICAgICAgICAgIHZhciBpbmRleGxlbmd0aCAgICA9IHNsaWRlQ291bnQgLSAxO1xyXG4gICAgICAgICAgICB2YXIgd3JhcGVyV2lkdGggICAgPSAkZWxlbWVudC53aWR0aCgpO1xyXG4gICAgICAgICAgICB2YXIgY29sdW1uICAgICAgICAgPSBzZXR0aW5ncy5jb2x1bW4gfHwgMTtcclxuICAgICAgICAgICAgdmFyIHNsaWRlV2lkdGggICAgID0gTWF0aC5jZWlsKCB3cmFwZXJXaWR0aCAvIGNvbHVtbiApO1xyXG4gICAgICAgICAgICB2YXIgZGVsYXkgICAgICAgICAgPSBzZXR0aW5ncy5wYXVzZVRpbWUgfHwgMzAwMDtcclxuICAgICAgICAgICAgdmFyIGxvb3AgICAgICAgICAgID0gc2V0dGluZ3MubG9vcDtcclxuICAgICAgICAgICAgdmFyIHNwZWVkICAgICAgICAgID0gc2V0dGluZ3MuYW5pbVNwZWVkO1xyXG4gICAgICAgICAgICB2YXIgcGFnaW5hdGlvbiAgICAgPSBzZXR0aW5ncy5wYWdpbmF0aW9uO1xyXG4gICAgICAgICAgICB2YXIgaSAgICAgICAgICAgICAgPSAwO1xyXG5cclxuICAgICAgICAgICAgaWYobG9vcCl7IFxyXG4gICAgICAgICAgICAgICAgZm9yKDsgaSA8IGNvbHVtbiA7IGkrKyApe1xyXG4gICAgICAgICAgICAgICAgICAgICRjbG9uZVNsaWRlID0gJCggJGluaXRpYWxTbGlkZXNbaV0gKS5jbG9uZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICRzbGlkZVdyYXBlci5hcHBlbmQoJGNsb25lU2xpZGUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkY2xvbmVTbGlkZSA9ICQoICRpbml0aWFsU2xpZGVzW2luZGV4bGVuZ3RoIC0gaV0gKS5jbG9uZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICRzbGlkZVdyYXBlci5wcmVwZW5kKCRjbG9uZVNsaWRlKTtcclxuICAgICAgICAgICAgICAgICAgICBzbGlkZUNvdW50ICs9IDI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmKHBhZ2luYXRpb24pe1xyXG4gICAgICAgICAgICAgICAgJHBhZ2luYXRpb24gPSAkKCc8dWwgY2xhc3M9XCJhai1zbGlkZVBnV3JhcGVyXCI+PC91bD4nKTtcclxuICAgICAgICAgICAgICAgIGZvciggaSA9IDAgOyBpIDwgaW5kZXhsZW5ndGggKyAxIDsgaSsrKXtcclxuICAgICAgICAgICAgICAgICAgICAkcGFnaW5hdGlvbi5hcHBlbmQoJzxsaSBkYXRhLWluZGV4PScraSsnPjwvbGk+Jyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAkZWxlbWVudC5hcHBlbmQoICRwYWdpbmF0aW9uICk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICRwYWdpbmF0aW9uLm9uKCd0YXAnLCBmdW5jdGlvbihlKXtcclxuICAgICAgICAgICAgICAgIHZhciBpbmRleCA9ICQoZS50YXJnZXQpLmRhdGEoJ2luZGV4Jyk7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5zbGlkZVRvKGluZGV4ICsgY29sdW1uKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvL+WIneWni+WMluaVsOaNrlxyXG4gICAgICAgICAgICB0aGlzLnNldHRpbmdzICAgICAgICA9IHNldHRpbmdzIHx8IHt9O1xyXG4gICAgICAgICAgICB0aGlzLnNsaWRlV2lkdGggICAgICA9IHNsaWRlV2lkdGg7XHJcbiAgICAgICAgICAgIHRoaXMuc2xpZGVXcmFwZXIgICAgID0gJHNsaWRlV3JhcGVyO1xyXG4gICAgICAgICAgICB0aGlzLmNvbnRhaW50ZXIgICAgICA9ICRlbGVtZW50O1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRJbmRleCAgICA9IHNldHRpbmdzLnNldHRpbmdzIHx8IDA7IFxyXG4gICAgICAgICAgICB0aGlzLnRvdWNoZXMgICAgICAgICA9IHt9O1xyXG4gICAgICAgICAgICB0aGlzLmF1dG9QbGF5VGltZXJJZCA9ICcnO1xyXG4gICAgICAgICAgICB0aGlzLnRvdWNoZVN0YXJ0VGltZSA9ICcnO1xyXG4gICAgICAgICAgICB0aGlzLnBhZ2luYXRpb24gICAgICA9ICRwYWdpbmF0aW9uO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgJHNsaWRlV3JhcGVyLmNzcyh7XHJcbiAgICAgICAgICAgICAgICB3aWR0aDogc2xpZGVXaWR0aCAqIHNsaWRlQ291bnRcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNpbGVudFNsaWRlVG8oY29sdW1uKTtcclxuXHJcbiAgICAgICAgICAgICRzbGlkZVdyYXBlci5vbigndG91Y2hzdGFydCcsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgICAgICAgICAgX3RoaXMub25Ub3VjaFN0YXJ0LmNhbGwoX3RoaXMsZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgJHNsaWRlV3JhcGVyLm9uKCd0b3VjaG1vdmUnLCBmdW5jdGlvbihlKXtcclxuICAgICAgICAgICAgICAgIF90aGlzLm9uVG91Y2hNb3ZlLmNhbGwoX3RoaXMsZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgJHNsaWRlV3JhcGVyLm9uKCd0b3VjaGVuZCcsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgICAgICAgICAgX3RoaXMub25Ub3VjaEVuZC5jYWxsKF90aGlzLGUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgc3B0ID0gQWpTbGlkZXIucHJvdG90eXBlO1xyXG5cclxuICAgICAgICBzcHQuc2xpZGVUbyA9IGZ1bmN0aW9uKGluZGV4KXtcclxuICAgICAgICAgICAgdmFyICRwYWdpbmF0aW9uLCB0YXJnZXRMaTtcclxuICAgICAgICAgICAgdmFyIF90aGlzICAgICAgPSB0aGlzO1xyXG4gICAgICAgICAgICB2YXIgbGVuZ3RoICAgICA9IHRoaXMuc2xpZGVXcmFwZXIuZmluZCgnLicrZG9tU3Ryc1syXSkubGVuZ3RoO1xyXG4gICAgICAgICAgICB2YXIgbG9vcCAgICAgICA9IHRoaXMuc2V0dGluZ3MubG9vcDtcclxuICAgICAgICAgICAgdmFyIGNvbHVtbiAgICAgPSB0aGlzLnNldHRpbmdzLmNvbHVtbjtcclxuICAgICAgICAgICAgdmFyIHBhZ2luYXRpb24gPSB0aGlzLnNldHRpbmdzLnBhZ2luYXRpb247XHJcbiAgICAgICAgICAgIHZhciB0cmFuc2xhdGVYID0gLShpbmRleCAqIHRoaXMuc2xpZGVXaWR0aCk7XHJcbiAgICAgICAgICAgIHZhciBzcGVlZCAgICAgID0gdGhpcy5zZXR0aW5ncy5hbmltU3BlZWQgfHwgNTAwO1xyXG5cclxuICAgICAgICAgICAgaWYoaXNVbmRlZmluZWQoaW5kZXgpIHx8IGluZGV4PDApe1xyXG4gICAgICAgICAgICAgICAgaW5kZXggPSAwO1xyXG4gICAgICAgICAgICB9IFxyXG4gICAgICAgICAgICBpZihpbmRleCA+IChsZW5ndGgtMSkpe1xyXG4gICAgICAgICAgICAgICAgaW5kZXggPSBsZW5ndGgtMTtcclxuICAgICAgICAgICAgfSBcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudEluZGV4ID0gaW5kZXg7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5zdXBwb3J0LnRyYW5zZm9ybXMzZCl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNsaWRlV3JhcGVyLnRyYW5zZm9ybSgndHJhbnNsYXRlM2QoJyArIHRyYW5zbGF0ZVggKyAncHgsIDBweCwgMHB4KScpOyAgXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNsaWRlV3JhcGVyLnRyYW5zZm9ybSgndHJhbnNsYXRlKCcgKyB0cmFuc2xhdGVYICsgJ3B4LCAwcHgpJyk7XHJcbiAgICAgICAgICAgIH0gXHJcblxyXG4gICAgICAgICAgICBpZihsb29wKXtcclxuICAgICAgICAgICAgICAgIGlmKCAobGVuZ3RoIC0gY29sdW1uKSA9PT0gaW5kZXggKXtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5zbGlkZVdyYXBlci50cmFuc2l0aW9uRW5kKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGNvbHVtbik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLnNpbGVudFNsaWRlVG8oY29sdW1uKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0gXHJcbiAgICAgICAgICAgICAgICBpZiggMCA9PT0gaW5kZXggKXtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5zbGlkZVdyYXBlci50cmFuc2l0aW9uRW5kKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLnNpbGVudFNsaWRlVG8obGVuZ3RoIC0gMiAqIGNvbHVtbik7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmKHBhZ2luYXRpb24pe1xyXG4gICAgICAgICAgICAgICAgJHBhZ2luYXRpb24gPSBfdGhpcy5wYWdpbmF0aW9uO1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0TGkgPSAkcGFnaW5hdGlvbi5maW5kKCdsaScpW190aGlzLmN1cnJlbnRJbmRleCAtIGNvbHVtbl07XHJcbiAgICAgICAgICAgICAgICAkKHRhcmdldExpKS5hZGRDbGFzcygnYWN0aXZlJykuc2libGluZ3MoKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgc3B0LnNpbGVudFNsaWRlVG8gPSBmdW5jdGlvbihpbmRleCl7XHJcbiAgICAgICAgICAgIHZhciBzcGVlZCA9IHRoaXMuc2V0dGluZ3MuYW5pbVNwZWVkIHx8IDUwMDtcclxuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICAgICAgX3RoaXMuc2xpZGVXcmFwZXIudHJhbnNpdGlvbigwKTtcclxuICAgICAgICAgICAgX3RoaXMuc2xpZGVUbyhpbmRleCk7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIF90aGlzLnNsaWRlV3JhcGVyLnRyYW5zaXRpb24oc3BlZWQpO1xyXG4gICAgICAgICAgICB9LCAxMDApO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHNwdC5hdXRvcGxheSA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHZhciBpbmRleDtcclxuICAgICAgICAgICAgdmFyIF90aGlzICAgID0gdGhpcztcclxuICAgICAgICAgICAgdmFyIHNldHRpbmdzID0gX3RoaXMuc2V0dGluZ3M7XHJcbiAgICAgICAgICAgIHZhciBwYXVzaW5nICA9IF90aGlzLnBhdXNpbmc7XHJcbiAgICAgICAgICAgIHZhciBsZW5ndGggICA9IF90aGlzLnNsaWRlV3JhcGVyLmZpbmQoJy4nK2RvbVN0cnNbMl0pLmxlbmd0aDtcclxuICAgICAgICAgICAgdmFyIGRlbGF5ICAgID0gc2V0dGluZ3MucGF1c2VUaW1lO1xyXG4gICAgICAgICAgICB2YXIgZHVyYXRpb24gPSBzZXR0aW5ncy5kdXJhdGlvbjtcclxuICAgICAgICAgICAgdmFyIGxvb3AgICAgID0gc2V0dGluZ3MubG9vcDtcclxuICAgICAgICAgICAgdmFyIHNwZWVkICAgID0gc2V0dGluZ3MuYW5pbVNwZWVkIHx8IDUwMDtcclxuICAgICAgICAgICAgdmFyIGNvbHVtbiAgID0gdGhpcy5zZXR0aW5ncy5jb2x1bW47XHJcblxyXG4gICAgICAgICAgICBpZighcGF1c2luZyl7XHJcbiAgICAgICAgICAgICAgICBpbmRleCA9IF90aGlzLmN1cnJlbnRJbmRleCArIDE7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5zbGlkZVRvKGluZGV4KTtcclxuICAgICAgICAgICAgICAgIGlmKChsZW5ndGggLSAxKSA9PT0gaW5kZXgpe1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKCFsb29wKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLnNsaWRlV3JhcGVyLnRyYW5zaXRpb25FbmQoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLnNpbGVudFNsaWRlVG8oY29sdW1uKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgX3RoaXMuc2xpZGVXcmFwZXIudHJhbnNpdGlvbkVuZChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dChfdGhpcy5hdXRvUGxheVRpbWVySWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLmF1dG9QbGF5VGltZXJJZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2xpZGVXcmFwZXIudHJhbnNpdGlvbihzcGVlZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmF1dG9wbGF5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgZGVsYXkpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoX3RoaXMuYXV0b1BsYXlUaW1lcklkKTtcclxuICAgICAgICAgICAgICAgIF90aGlzLmF1dG9QbGF5VGltZXJJZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5zbGlkZVdyYXBlci50cmFuc2l0aW9uKHNwZWVkKTtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5hdXRvcGxheSgpO1xyXG4gICAgICAgICAgICAgICAgfSwgZGVsYXkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgc3B0Lm9uVG91Y2hTdGFydCA9IGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgICAgICBfdGhpcy5wYXVzaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIF90aGlzLnRvdWNoZXMuc3RhcnRYICA9IF90aGlzLnRvdWNoZXMuY3VycmVudFggPSBlLnRvdWNoZXNbMF0ucGFnZVg7XHJcbiAgICAgICAgICAgIF90aGlzLndyYXBlclRyYW5zbGF0ZVggPSB0aGlzLmdldFRyYW5zbGF0ZVgoIHRoaXMuc2xpZGVXcmFwZXJbMF0gKTtcclxuICAgICAgICAgICAgX3RoaXMudG91Y2hlU3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcclxuICAgICAgICAgICAgX3RoaXMuc2xpZGVXcmFwZXIudHJhbnNpdGlvbigwKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzcHQub25Ub3VjaE1vdmUgPSBmdW5jdGlvbihlKXtcclxuICAgICAgICAgICAgdmFyIHdyYXBlclRyYW5zbGF0ZVgsXHJcbiAgICAgICAgICAgICAgICBjdXJyZW50VHJhbnNsYXRlO1xyXG5cclxuICAgICAgICAgICAgdmFyIGRpZmYgICAgICAgICAgID0gMDtcclxuICAgICAgICAgICAgdmFyIHN0YXJ0VHJhbnNsYXRlID0gMDtcclxuXHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMudG91Y2hlcy5jdXJyZW50WCA9IGUudG91Y2hlc1swXS5wYWdlWDtcclxuXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBkaWZmID0gdGhpcy50b3VjaGVzLmN1cnJlbnRYIC0gdGhpcy50b3VjaGVzLnN0YXJ0WDtcclxuICAgICAgICAgICAgY3VycmVudFRyYW5zbGF0ZSA9IHRoaXMud3JhcGVyVHJhbnNsYXRlWCArIGRpZmY7XHJcbiAgICAgICAgICAgIGlmKHRoaXMuc3VwcG9ydC50cmFuc2Zvcm1zM2Qpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zbGlkZVdyYXBlci50cmFuc2Zvcm0oJ3RyYW5zbGF0ZTNkKCcgKyBjdXJyZW50VHJhbnNsYXRlICsgJ3B4LCAwcHgsIDBweCknKTsgIFxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zbGlkZVdyYXBlci50cmFuc2Zvcm0oJ3RyYW5zbGF0ZSgnICsgY3VycmVudFRyYW5zbGF0ZSArICdweCwgMHB4KScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgc3B0Lm9uVG91Y2hFbmQgPSBmdW5jdGlvbihlKXtcclxuICAgICAgICAgICAgdmFyIG5vd1RpbWUgPSBEYXRlLm5vdygpO1xyXG4gICAgICAgICAgICB2YXIgc2xpZGVUb0luZGV4ID0gMCA7XHJcbiAgICAgICAgICAgIHZhciBzcGVlZCAgICAgICAgPSB0aGlzLnNldHRpbmdzLmFuaW1TcGVlZDtcclxuICAgICAgICAgICAgdmFyIGRpZmYgICAgICAgICA9IHRoaXMudG91Y2hlcy5jdXJyZW50WCAtIHRoaXMudG91Y2hlcy5zdGFydFg7XHJcbiAgICAgICAgICAgIHZhciBhYnNEaWZmICAgICAgPSBNYXRoLmFicyhkaWZmKTtcclxuICAgICAgICAgICAgdmFyIHNsaWRlV2lkdGggICA9IHRoaXMuc2xpZGVXaWR0aDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucGF1c2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLnNsaWRlV3JhcGVyLnRyYW5zaXRpb24oIHNwZWVkICk7XHJcblxyXG4gICAgICAgICAgICBpZiggKChhYnNEaWZmIDwgc2xpZGVXaWR0aC8zKSAmJiBcclxuICAgICAgICAgICAgICAgIChub3dUaW1lIC0gdGhpcy50b3VjaGVTdGFydFRpbWUpID4gMjAwIHx8IGFic0RpZmYgPCAxMCApKXtcclxuICAgICAgICAgICAgICAgIHNsaWRlVG9JbmRleCA9IHRoaXMuY3VycmVudEluZGV4O1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYoIGRpZmYgPCAwICl7XHJcbiAgICAgICAgICAgICAgICBzbGlkZVRvSW5kZXggPSArK3RoaXMuY3VycmVudEluZGV4O1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2xpZGVUb0luZGV4ID0gLS10aGlzLmN1cnJlbnRJbmRleDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnNsaWRlV3JhcGVyLnRyYW5zaXRpb24oMjAwKTtcclxuICAgICAgICAgICAgdGhpcy5zbGlkZVRvKCBzbGlkZVRvSW5kZXggKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzcHQuZ2V0VHJhbnNsYXRlWCA9IGZ1bmN0aW9uIChlbCkge1xyXG4gICAgICAgICAgICB2YXIgbWF0cml4LCBjdXJUcmFuc2Zvcm0sIGN1clN0eWxlLCB0cmFuc2Zvcm1NYXRyaXg7XHJcblxyXG4gICAgICAgICAgICBjdXJTdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsLCBudWxsKTtcclxuICAgICAgICAgICAgaWYgKHdpbmRvdy5XZWJLaXRDU1NNYXRyaXgpIHtcclxuICAgICAgICAgICAgICAgIGN1clRyYW5zZm9ybSA9IGN1clN0eWxlLnRyYW5zZm9ybSB8fCBjdXJTdHlsZS53ZWJraXRUcmFuc2Zvcm07XHJcbiAgICAgICAgICAgICAgICBpZiAoY3VyVHJhbnNmb3JtLnNwbGl0KCcsJykubGVuZ3RoID4gNikge1xyXG4gICAgICAgICAgICAgICAgICAgIGN1clRyYW5zZm9ybSA9IGN1clRyYW5zZm9ybS5zcGxpdCgnLCAnKS5tYXAoZnVuY3Rpb24oYSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhLnJlcGxhY2UoJywnLCcuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSkuam9pbignLCAnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIFNvbWUgb2xkIHZlcnNpb25zIG9mIFdlYmtpdCBjaG9rZSB3aGVuICdub25lJyBpcyBwYXNzZWQ7IHBhc3NcclxuICAgICAgICAgICAgICAgIC8vIGVtcHR5IHN0cmluZyBpbnN0ZWFkIGluIHRoaXMgY2FzZVxyXG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtTWF0cml4ID0gbmV3IHdpbmRvdy5XZWJLaXRDU1NNYXRyaXgoY3VyVHJhbnNmb3JtID09PSAnbm9uZScgPyAnJyA6IGN1clRyYW5zZm9ybSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1NYXRyaXggPSBjdXJTdHlsZS5Nb3pUcmFuc2Zvcm0gfHwgY3VyU3R5bGUuT1RyYW5zZm9ybSB8fCBjdXJTdHlsZS5Nc1RyYW5zZm9ybSB8fCBjdXJTdHlsZS5tc1RyYW5zZm9ybSAgfHwgY3VyU3R5bGUudHJhbnNmb3JtIHx8IGN1clN0eWxlLmdldFByb3BlcnR5VmFsdWUoJ3RyYW5zZm9ybScpLnJlcGxhY2UoJ3RyYW5zbGF0ZSgnLCAnbWF0cml4KDEsIDAsIDAsIDEsJyk7XHJcbiAgICAgICAgICAgICAgICBtYXRyaXggPSB0cmFuc2Zvcm1NYXRyaXgudG9TdHJpbmcoKS5zcGxpdCgnLCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgIGlmICh3aW5kb3cuV2ViS2l0Q1NTTWF0cml4KXtcclxuICAgICAgICAgICAgICAgIGN1clRyYW5zZm9ybSA9IHRyYW5zZm9ybU1hdHJpeC5tNDE7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjdXJUcmFuc2Zvcm0gPSBwYXJzZUZsb2F0KG1hdHJpeFs0XSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBjdXJUcmFuc2Zvcm0gfHwgMDtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzcHQuc3VwcG9ydCA9IHtcclxuICAgICAgICAgICAgdHJhbnNmb3JtczNkIDogKHdpbmRvdy5Nb2Rlcm5penIgJiYgTW9kZXJuaXpyLmNzc3RyYW5zZm9ybXMzZCA9PT0gdHJ1ZSkgfHwgKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKS5zdHlsZTtcclxuICAgICAgICAgICAgICAgIHJldHVybiAoJ3dlYmtpdFBlcnNwZWN0aXZlJyBpbiBkaXYgfHwgJ01velBlcnNwZWN0aXZlJyBpbiBkaXYgfHwgJ09QZXJzcGVjdGl2ZScgaW4gZGl2IHx8ICdNc1BlcnNwZWN0aXZlJyBpbiBkaXYgfHwgJ3BlcnNwZWN0aXZlJyBpbiBkaXYpO1xyXG4gICAgICAgICAgICB9KSgpXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIGluaXRTbGlkZXIgPSBmdW5jdGlvbihlbGVtZW50LCBzZXR0aW5ncyl7XHJcbiAgICAgICAgICAgIHZhciAkZWxlbWVudCAgICA9ICQoZWxlbWVudCk7XHJcbiAgICAgICAgICAgIHZhciBkZWxheSAgICAgICA9IHNldHRpbmdzLnBhdXNlVGltZTtcclxuICAgICAgICAgICAgdmFyIGF1dG9wbGF5ICAgID0gc2V0dGluZ3MuYXV0b3BsYXk7XHJcblxyXG4gICAgICAgICAgICB2YXIgYWpTbGlkZXJFbGUgPSBuZXcgQWpTbGlkZXIoJGVsZW1lbnQsIHNldHRpbmdzKTtcclxuICAgICAgICAgICAgaWYoYXV0b3BsYXkpe1xyXG4gICAgICAgICAgICAgICAgYWpTbGlkZXJFbGUuYXV0b1BsYXlUaW1lcklkID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgIGFqU2xpZGVyRWxlLmF1dG9wbGF5KCk7XHJcbiAgICAgICAgICAgICAgICB9LCBkZWxheSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBhalNsaWRlckVsZTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIFxyXG4gICAgICAgICQuZm4uYWpTbGlkZXIgPSBmdW5jdGlvbihvcHRpb25zKXtcclxuICAgICAgICAgICAgdmFyIHNldHRpbmdzID0gJC5leHRlbmQoe30sICQuZm4uYWpTbGlkZXIuZGVmYXVsdHMsIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICB2YXIgY29sdW1uICAgPSBzZXR0aW5ncy5jb2x1bW47XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKGluZGV4LGVsZW1lbnQpe1xyXG4gICAgICAgICAgICAgICAgdmFyICRlbGVtZW50ICAgID0gJChlbGVtZW50KTtcclxuICAgICAgICAgICAgICAgIHZhciBhalNsaWRlckVsZSA9IGluaXRTbGlkZXIoJGVsZW1lbnQsIHNldHRpbmdzKTtcclxuICAgICAgICAgICAgICAgICR3aW4ub24oJ3Jlc2l6ZS5halNsaWRlcicsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGFqU2xpZGVyRWxlLmF1dG9QbGF5VGltZXJJZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYWpTbGlkZXJFbGUuc2lsZW50U2xpZGVUbyhjb2x1bW4pO1xyXG4gICAgICAgICAgICAgICAgICAgIGFqU2xpZGVyRWxlID0gaW5pdFNsaWRlcigkZWxlbWVudCwgc2V0dGluZ3MpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vRGVmYXVsdCBzZXR0aW5nc1xyXG4gICAgICAgICQuZm4uYWpTbGlkZXIuZGVmYXVsdHMgPSB7XHJcbiAgICAgICAgICAgIHN0YXJ0U2xpZGU6MCwgXHJcbiAgICAgICAgICAgIGFuaW1TcGVlZDogNTAwLFxyXG4gICAgICAgICAgICBwYXVzZVRpbWU6IDMwMDAsXHJcbiAgICAgICAgICAgIGF1dG9wbGF5OiBmYWxzZSxcclxuICAgICAgICAgICAgcGFnaW5hdGlvbjp0cnVlLFxyXG4gICAgICAgICAgICBjb2x1bW46IDEsXHJcbiAgICAgICAgICAgIGxvb3A6dHJ1ZVxyXG4gICAgICAgIH07XHJcbiAgICB9KSgpO1xyXG4gICAgXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGxheWVyOiBsYXllclxyXG4gICAgfTtcclxuXHJcbn0pKFplcHRvKTsiXSwiZmlsZSI6InRndWlfbW9iaWxlLTZiNzg2ZjY5OWQuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
