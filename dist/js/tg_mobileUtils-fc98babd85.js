/**
 * MobileWeb 通用功能
 *
 * 该文件应该在head中尽可能早的引入，减少页面重绘
 * 
 */
window.tgMobileUtil = (function(win, doc) {
	var docEl = doc.documentElement;

	//UA判断
    var UA = navigator.userAgent,
		isAndroid = /android|adr/gi.test(UA),
		isIos = /iphone|ipod|ipad/gi.test(UA) && !isAndroid, // 据说某些国产机的UA会同时包含 android iphone 字符
		isMobile = isAndroid || isIos;  // 粗略的判断


	/**====================================================================
	
	 * tg移动端适配策略
	 * 
	 * 	一、 移动页面自适用
	 *  	1. 设计稿参考为750px, 然后适配其他屏幕宽度
	 * 	 	2. 动态计算html fontSize值, 每个设计稿分为十份 rem = layoutviewport/10
	 * 	  	3. 需要动态布局的地方使用rem为单位(margin、padding、width....)
	 * 	   	4. 字体建议使用px, [可以选择使用css3媒体查询适配不同屏幕]
	 * 	    5. 图片使用双倍图片,响应式图片不建议使用spirit-img, 最好使用img标签直接引入或者单个背景图片
	 *
	 * 	二、 meta标签写法为：
	 * 		1. <meta name="viewport" content="initial-scale=0.5, 
	 * 			width=device-width, maximum-scale=0.5, minimum-scale=0.5, user-scalable=no">
	 *    	2. 如果页面没有该标签，则会追加该标签
	 *
	 * 	三、 对外API window.tgMobileUtil.flexible
	 * 		rem: html fontSize大小
     *    	refreshRem: refreshRem, 重新调整rem大小
     *    	rem2px: rem2px: 根据rem计算px
     *    	px2rem: px2rem: 根据px计算rem大小
	 * 
	 *===================================================================**/
	var flexible = (function(){
		var tid, head;
		var rem = 75;

		var metaEl = doc.querySelector('meta[name="viewport"]');
		
		//如果有meta标签，则设置meta标签
		if(!metaEl){
			metaEl = doc.createElement('meta');
			metaEl.setAttribute('name', 'viewport');
			metaEl.setAttribute('content', fillScale(0.5));
			head = docEl.firstElementChild;
			if(head){
				head.insertBefore(metaEl, head.firstElementChild);
			} else {
				var wrap = doc.createElement( 'div' );
				wrap.appendChild(metaEl);
				doc.write(wrap.innerHTML);
			}
		}

		//页面的px最大值
		function refreshRem(){
			var width = docEl.getBoundingClientRect().width;
			rem = width / 10;
			docEl.style.fontSize = rem + 'px';
		}

		//屏幕变化
		win.addEventListener('resize', function(){
			clearTimeout(tid);
			setTimeout(refreshRem, 300);
		}, false);

		//页面开始展示
		win.addEventListener('pageshow', function(e) {
	        if (e.persisted) {
	            clearTimeout(tid);
	            tid = setTimeout(refreshRem, 300);
	        }
	    }, false);

	    refreshRem();

	    //rem转px
	    var rem2px = function(d) {
	        var val = parseFloat(d, 10) * this.rem;
	        if (typeof d === 'string' && d.match(/rem$/)) {
	            val += 'px';
	        }
	        return val;
	    };

	    //px转rem
	    var px2rem = function(d) {
	        var val = parseFloat(d, 10) / this.rem;
	        if (typeof d === 'string' && d.match(/px$/)) {
	            val += 'rem';
	        }
	        return val;
	    };

	    function fillScale(scale) {
            return 'initial-scale=' + scale + ',maximum-scale=' + scale + ',minimum-scale=' + scale + ',width=device-width,user-scalable=no';
        }

        return {
        	rem: rem,
        	refreshRem: refreshRem,
        	rem2px: rem2px,
        	px2rem: px2rem
        };

	})();

	return {
		isAndroid: isAndroid,
		isIos: isIos,
		isMobile: isMobile,

        isNewsApp: /NewsApp\/[\d\.]+/gi.test(UA),
		isWeixin: /MicroMessenger/gi.test(UA),
		isQQ: /QQ\/\d/gi.test(UA),
		isYixin: /YiXin/gi.test(UA),
		isWeibo: /Weibo/gi.test(UA),
		isTXWeibo: /T(?:X|encent)MicroBlog/gi.test(UA),

		tapEvent: isMobile ? 'tap' : 'click',

		/**
		 * 转href参数成键值对
		 * @param href {string} 指定的href，默认为当前页href
		 * @returns {object} 键值对
		 */
		getSearch: function(href) {
			href = href || win.location.search;
			var data = {},reg = new RegExp( "([^?=&]+)(=([^&]*))?", "g" );
			href && href.replace(reg,function( $0, $1, $2, $3 ){
				data[ $1 ] = $3;
			});
			return data;
		},

		flexible: flexible

	};
 
})(window, document);

