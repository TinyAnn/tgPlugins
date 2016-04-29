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


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJ0Z19tb2JpbGVVdGlscy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogTW9iaWxlV2ViIOmAmueUqOWKn+iDvVxyXG4gKlxyXG4gKiDor6Xmlofku7blupTor6XlnKhoZWFk5Lit5bC95Y+v6IO95pep55qE5byV5YWl77yM5YeP5bCR6aG16Z2i6YeN57uYXHJcbiAqIFxyXG4gKi9cclxud2luZG93LnRnTW9iaWxlVXRpbCA9IChmdW5jdGlvbih3aW4sIGRvYykge1xyXG5cdHZhciBkb2NFbCA9IGRvYy5kb2N1bWVudEVsZW1lbnQ7XHJcblxyXG5cdC8vVUHliKTmlq1cclxuICAgIHZhciBVQSA9IG5hdmlnYXRvci51c2VyQWdlbnQsXHJcblx0XHRpc0FuZHJvaWQgPSAvYW5kcm9pZHxhZHIvZ2kudGVzdChVQSksXHJcblx0XHRpc0lvcyA9IC9pcGhvbmV8aXBvZHxpcGFkL2dpLnRlc3QoVUEpICYmICFpc0FuZHJvaWQsIC8vIOaNruivtOafkOS6m+WbveS6p+acuueahFVB5Lya5ZCM5pe25YyF5ZCrIGFuZHJvaWQgaXBob25lIOWtl+esplxyXG5cdFx0aXNNb2JpbGUgPSBpc0FuZHJvaWQgfHwgaXNJb3M7ICAvLyDnspfnlaXnmoTliKTmlq1cclxuXHJcblxyXG5cdC8qKj09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblx0XHJcblx0ICogdGfnp7vliqjnq6/pgILphY3nrZbnlaVcclxuXHQgKiBcclxuXHQgKiBcdOS4gOOAgSDnp7vliqjpobXpnaLoh6rpgILnlKhcclxuXHQgKiAgXHQxLiDorr7orqHnqL/lj4LogIPkuLo3NTBweCwg54S25ZCO6YCC6YWN5YW25LuW5bGP5bmV5a695bqmXHJcblx0ICogXHQgXHQyLiDliqjmgIHorqHnrpdodG1sIGZvbnRTaXpl5YC8LCDmr4/kuKrorr7orqHnqL/liIbkuLrljYHku70gcmVtID0gbGF5b3V0dmlld3BvcnQvMTBcclxuXHQgKiBcdCAgXHQzLiDpnIDopoHliqjmgIHluIPlsYDnmoTlnLDmlrnkvb/nlKhyZW3kuLrljZXkvY0obWFyZ2lu44CBcGFkZGluZ+OAgXdpZHRoLi4uLilcclxuXHQgKiBcdCAgIFx0NC4g5a2X5L2T5bu66K6u5L2/55SocHgsIFvlj6/ku6XpgInmi6nkvb/nlKhjc3Mz5aqS5L2T5p+l6K+i6YCC6YWN5LiN5ZCM5bGP5bmVXVxyXG5cdCAqIFx0ICAgIDUuIOWbvueJh+S9v+eUqOWPjOWAjeWbvueJhyzlk43lupTlvI/lm77niYfkuI3lu7rorq7kvb/nlKhzcGlyaXQtaW1nLCDmnIDlpb3kvb/nlKhpbWfmoIfnrb7nm7TmjqXlvJXlhaXmiJbogIXljZXkuKrog4zmma/lm77niYdcclxuXHQgKlxyXG5cdCAqIFx05LqM44CBIG1ldGHmoIfnrb7lhpnms5XkuLrvvJpcclxuXHQgKiBcdFx0MS4gPG1ldGEgbmFtZT1cInZpZXdwb3J0XCIgY29udGVudD1cImluaXRpYWwtc2NhbGU9MC41LCBcclxuXHQgKiBcdFx0XHR3aWR0aD1kZXZpY2Utd2lkdGgsIG1heGltdW0tc2NhbGU9MC41LCBtaW5pbXVtLXNjYWxlPTAuNSwgdXNlci1zY2FsYWJsZT1ub1wiPlxyXG5cdCAqICAgIFx0Mi4g5aaC5p6c6aG16Z2i5rKh5pyJ6K+l5qCH562+77yM5YiZ5Lya6L+95Yqg6K+l5qCH562+XHJcblx0ICpcclxuXHQgKiBcdOS4ieOAgSDlr7nlpJZBUEkgd2luZG93LnRnTW9iaWxlVXRpbC5mbGV4aWJsZVxyXG5cdCAqIFx0XHRyZW06IGh0bWwgZm9udFNpemXlpKflsI9cclxuICAgICAqICAgIFx0cmVmcmVzaFJlbTogcmVmcmVzaFJlbSwg6YeN5paw6LCD5pW0cmVt5aSn5bCPXHJcbiAgICAgKiAgICBcdHJlbTJweDogcmVtMnB4OiDmoLnmja5yZW3orqHnrpdweFxyXG4gICAgICogICAgXHRweDJyZW06IHB4MnJlbTog5qC55o2ucHjorqHnrpdyZW3lpKflsI9cclxuXHQgKiBcclxuXHQgKj09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0qKi9cclxuXHR2YXIgZmxleGlibGUgPSAoZnVuY3Rpb24oKXtcclxuXHRcdHZhciB0aWQsIGhlYWQ7XHJcblx0XHR2YXIgcmVtID0gNzU7XHJcblxyXG5cdFx0dmFyIG1ldGFFbCA9IGRvYy5xdWVyeVNlbGVjdG9yKCdtZXRhW25hbWU9XCJ2aWV3cG9ydFwiXScpO1xyXG5cdFx0XHJcblx0XHQvL+WmguaenOaciW1ldGHmoIfnrb7vvIzliJnorr7nva5tZXRh5qCH562+XHJcblx0XHRpZighbWV0YUVsKXtcclxuXHRcdFx0bWV0YUVsID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ21ldGEnKTtcclxuXHRcdFx0bWV0YUVsLnNldEF0dHJpYnV0ZSgnbmFtZScsICd2aWV3cG9ydCcpO1xyXG5cdFx0XHRtZXRhRWwuc2V0QXR0cmlidXRlKCdjb250ZW50JywgZmlsbFNjYWxlKDAuNSkpO1xyXG5cdFx0XHRoZWFkID0gZG9jRWwuZmlyc3RFbGVtZW50Q2hpbGQ7XHJcblx0XHRcdGlmKGhlYWQpe1xyXG5cdFx0XHRcdGhlYWQuaW5zZXJ0QmVmb3JlKG1ldGFFbCwgaGVhZC5maXJzdEVsZW1lbnRDaGlsZCk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0dmFyIHdyYXAgPSBkb2MuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcclxuXHRcdFx0XHR3cmFwLmFwcGVuZENoaWxkKG1ldGFFbCk7XHJcblx0XHRcdFx0ZG9jLndyaXRlKHdyYXAuaW5uZXJIVE1MKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8v6aG16Z2i55qEcHjmnIDlpKflgLxcclxuXHRcdGZ1bmN0aW9uIHJlZnJlc2hSZW0oKXtcclxuXHRcdFx0dmFyIHdpZHRoID0gZG9jRWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGg7XHJcblx0XHRcdHJlbSA9IHdpZHRoIC8gMTA7XHJcblx0XHRcdGRvY0VsLnN0eWxlLmZvbnRTaXplID0gcmVtICsgJ3B4JztcclxuXHRcdH1cclxuXHJcblx0XHQvL+Wxj+W5leWPmOWMllxyXG5cdFx0d2luLmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGZ1bmN0aW9uKCl7XHJcblx0XHRcdGNsZWFyVGltZW91dCh0aWQpO1xyXG5cdFx0XHRzZXRUaW1lb3V0KHJlZnJlc2hSZW0sIDMwMCk7XHJcblx0XHR9LCBmYWxzZSk7XHJcblxyXG5cdFx0Ly/pobXpnaLlvIDlp4vlsZXnpLpcclxuXHRcdHdpbi5hZGRFdmVudExpc3RlbmVyKCdwYWdlc2hvdycsIGZ1bmN0aW9uKGUpIHtcclxuXHQgICAgICAgIGlmIChlLnBlcnNpc3RlZCkge1xyXG5cdCAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aWQpO1xyXG5cdCAgICAgICAgICAgIHRpZCA9IHNldFRpbWVvdXQocmVmcmVzaFJlbSwgMzAwKTtcclxuXHQgICAgICAgIH1cclxuXHQgICAgfSwgZmFsc2UpO1xyXG5cclxuXHQgICAgcmVmcmVzaFJlbSgpO1xyXG5cclxuXHQgICAgLy9yZW3ovaxweFxyXG5cdCAgICB2YXIgcmVtMnB4ID0gZnVuY3Rpb24oZCkge1xyXG5cdCAgICAgICAgdmFyIHZhbCA9IHBhcnNlRmxvYXQoZCwgMTApICogdGhpcy5yZW07XHJcblx0ICAgICAgICBpZiAodHlwZW9mIGQgPT09ICdzdHJpbmcnICYmIGQubWF0Y2goL3JlbSQvKSkge1xyXG5cdCAgICAgICAgICAgIHZhbCArPSAncHgnO1xyXG5cdCAgICAgICAgfVxyXG5cdCAgICAgICAgcmV0dXJuIHZhbDtcclxuXHQgICAgfTtcclxuXHJcblx0ICAgIC8vcHjovaxyZW1cclxuXHQgICAgdmFyIHB4MnJlbSA9IGZ1bmN0aW9uKGQpIHtcclxuXHQgICAgICAgIHZhciB2YWwgPSBwYXJzZUZsb2F0KGQsIDEwKSAvIHRoaXMucmVtO1xyXG5cdCAgICAgICAgaWYgKHR5cGVvZiBkID09PSAnc3RyaW5nJyAmJiBkLm1hdGNoKC9weCQvKSkge1xyXG5cdCAgICAgICAgICAgIHZhbCArPSAncmVtJztcclxuXHQgICAgICAgIH1cclxuXHQgICAgICAgIHJldHVybiB2YWw7XHJcblx0ICAgIH07XHJcblxyXG5cdCAgICBmdW5jdGlvbiBmaWxsU2NhbGUoc2NhbGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuICdpbml0aWFsLXNjYWxlPScgKyBzY2FsZSArICcsbWF4aW11bS1zY2FsZT0nICsgc2NhbGUgKyAnLG1pbmltdW0tc2NhbGU9JyArIHNjYWxlICsgJyx3aWR0aD1kZXZpY2Utd2lkdGgsdXNlci1zY2FsYWJsZT1ubyc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgIFx0cmVtOiByZW0sXHJcbiAgICAgICAgXHRyZWZyZXNoUmVtOiByZWZyZXNoUmVtLFxyXG4gICAgICAgIFx0cmVtMnB4OiByZW0ycHgsXHJcbiAgICAgICAgXHRweDJyZW06IHB4MnJlbVxyXG4gICAgICAgIH07XHJcblxyXG5cdH0pKCk7XHJcblxyXG5cdHJldHVybiB7XHJcblx0XHRpc0FuZHJvaWQ6IGlzQW5kcm9pZCxcclxuXHRcdGlzSW9zOiBpc0lvcyxcclxuXHRcdGlzTW9iaWxlOiBpc01vYmlsZSxcclxuXHJcbiAgICAgICAgaXNOZXdzQXBwOiAvTmV3c0FwcFxcL1tcXGRcXC5dKy9naS50ZXN0KFVBKSxcclxuXHRcdGlzV2VpeGluOiAvTWljcm9NZXNzZW5nZXIvZ2kudGVzdChVQSksXHJcblx0XHRpc1FROiAvUVFcXC9cXGQvZ2kudGVzdChVQSksXHJcblx0XHRpc1lpeGluOiAvWWlYaW4vZ2kudGVzdChVQSksXHJcblx0XHRpc1dlaWJvOiAvV2VpYm8vZ2kudGVzdChVQSksXHJcblx0XHRpc1RYV2VpYm86IC9UKD86WHxlbmNlbnQpTWljcm9CbG9nL2dpLnRlc3QoVUEpLFxyXG5cclxuXHRcdHRhcEV2ZW50OiBpc01vYmlsZSA/ICd0YXAnIDogJ2NsaWNrJyxcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIOi9rGhyZWblj4LmlbDmiJDplK7lgLzlr7lcclxuXHRcdCAqIEBwYXJhbSBocmVmIHtzdHJpbmd9IOaMh+WumueahGhyZWbvvIzpu5jorqTkuLrlvZPliY3pobVocmVmXHJcblx0XHQgKiBAcmV0dXJucyB7b2JqZWN0fSDplK7lgLzlr7lcclxuXHRcdCAqL1xyXG5cdFx0Z2V0U2VhcmNoOiBmdW5jdGlvbihocmVmKSB7XHJcblx0XHRcdGhyZWYgPSBocmVmIHx8IHdpbi5sb2NhdGlvbi5zZWFyY2g7XHJcblx0XHRcdHZhciBkYXRhID0ge30scmVnID0gbmV3IFJlZ0V4cCggXCIoW14/PSZdKykoPShbXiZdKikpP1wiLCBcImdcIiApO1xyXG5cdFx0XHRocmVmICYmIGhyZWYucmVwbGFjZShyZWcsZnVuY3Rpb24oICQwLCAkMSwgJDIsICQzICl7XHJcblx0XHRcdFx0ZGF0YVsgJDEgXSA9ICQzO1xyXG5cdFx0XHR9KTtcclxuXHRcdFx0cmV0dXJuIGRhdGE7XHJcblx0XHR9LFxyXG5cclxuXHRcdGZsZXhpYmxlOiBmbGV4aWJsZVxyXG5cclxuXHR9O1xyXG4gXHJcbn0pKHdpbmRvdywgZG9jdW1lbnQpO1xyXG5cclxuIl0sImZpbGUiOiJ0Z19tb2JpbGVVdGlscy1mYzk4YmFiZDg1LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
