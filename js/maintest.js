
(function(){
    var Util = (function(){
        var prefix = 'html5_reader_';  // prefix 前缀
        var StorageGetter = function(key) {
            return localStorage.getItem(prefix + key);
        };
        var StorageSetter = function(key, val) {
            return localStorage.setItem(prefix + key, val);
        };
        var getBSONP = function(url, callback){
            return $.jsonp({
                url : url,
                cache : true,
                callback : 'duokan_fiction_chapter',
                success : function(result){
                    var data = $.base64.decode(result);
                    var json = decodeURIComponent(escape(data));
                    callback(json);
                }
            })
        };
        return {
            getBSONP : getBSONP,
            StorageGetter : StorageGetter,
            StorageSetter : StorageSetter
        }
    })();
    
    // Dom节点的缓存
    var Dom = {
        top_nav :$('#top-nav'),
        bottom_nav :$('.bottom_nav'),
        font_container : $('.font-container'),
        font_button: $('#font-button'),
        night_button : $('#night-button'),
        bk_container : $('#bk-container'),
        bottom_tool_bar : $('#bottom_tool_bar'),
        bk_ul : $('.bk-container')
    };
    var Win = $(window);
    var Doc = $(document);
    var RootContainer = $('#fiction_container');

    
    // 初始化字体大小
    var initFontSize = Util.StorageGetter('font_size') ;
    initFontSize = parseInt(initFontSize);
    if(!initFontSize){
        initFontSize = 14;
    }
    RootContainer.css('font-size',initFontSize);
    
    // 记忆已设置的文字颜色
    var fontColor = Util.StorageGetter('font_color');
    if(!fontColor){
        fontColor = '#4e534f';
    }
    RootContainer.css('font-color',fontColor);
        
    //是否是夜间模式
    var NightMode = false;
    
    // 获取各类颜色值
    var bottom_color = Util.StorageGetter('bottom_color');
    var color = Util.StorageGetter('background_color');
    var font = Util.StorageGetter('font_color');

    // 初始化元素颜色值
    RootContainer.css('min-height', $(window).height() - 100);
    if (bottom_color) {
        $('#bottom_tool_bar_ul').find('li').css('color', bottom_color);
    }
    if (color) {
        $('body').css('background-color', color);
    }
    if (font) {
        $('.m-read-content').css('color', font);
    }

    //夜间模式
    if (fontColor = '#4e534f') {
        NightMode = true;
        $('#day_icon').show();
        $('#night_icon').hide();
        $('#bottom_tool_bar_ul').css('opacity', '0.6');
    }

    // 可设置背景颜色选项
    var colorArr = [{
        value: '#e9dfc7',
        name: 'default',
        font: ''
    }, {
        value : '#F0FFF0',
        name : 'seaGreen',
        font : '',
        id : "font_normal"
    }, {
        value : '#FFFFE0',
        name : 'lightYellow',
        font : ''
    }, {
        value : '#008000',
        name : 'green',
        font : ''
    }, {
        value : '#E1FFFF',
        name : 'lightCyan',
        font : '#7685a2',
        bottom_color : '#fff'
    }];

    // 交互的事件绑定
    function EventHandler(){
            
        // 屏幕唤出上下边栏交互
        $('#action_mid').click(function(){
            if(Dom.top_nav.css('display') === 'none'){
                Dom.bottom_nav.show();
                Dom.top_nav.show();
            }else{
                Dom.bottom_nav.hide();
                Dom.top_nav.hide();
                Dom.font_container.hide();
                Dom.font_button.removeClass('current');
            }
        });
        
        // 唤出字体面板交互
        Dom.font_button.click(function(){
            if(Dom.font_container.css('display') === 'none'){
                Dom.font_container.show();
                Dom.font_button.addClass('current');
            }else{
                Dom.font_container.hide();
                Dom.font_button.removeClass('current');
            }
        });
        
        // 字体大小设置
        $('#large-font').click(function(){
            if(initFontSize > 20){
                return;
            }
            initFontSize += 1;
            RootContainer.css('font-size',initFontSize);
        });
        $('#small-font').click(function(){
            if(initFontSize < 12 ){
                return;
            }
            initFontSize -= 1;
            RootContainer.css('font-size',initFontSize);
            Util.StorageSetter('font_size',initFontSize);
        });

        // 字体面板中的黑白天阅读模式切换

         //夜间和白天模式的转化
        Dom.night_button.click(function() {
            if (NightMode) {
                $('#day_icon').hide();
                $('#night_icon').show();
                $('#font_normal').trigger('click');
                $('.m-read-content').css('background', '#0f1410');
                $('.m-read-content').css('color', '#4e534f');
                NightMode = false;
            } else {
                $('#day_icon').show();
                $('#night_icon').hide();
                $('#font_night').trigger('click');
                $('.m-read-content').css('background', '#e9dfc7');
                NightMode = true;
            }
        });
        
        // 背景颜色div
        $('ul li').click(function(){
            var curBKIndex = $('.child-mod ul li').index(this);
            for (var i=0; i<colorArr.length; i++) {
                if(curBKIndex > 0){
                    $('.m-read-content').css('background', colorArr[curBKIndex].value);
                }
            } 
        });

        //字体和背景颜色的信息设置
        Dom.bk_container.delegate('.bk-container', 'click', function() {
            
            var color = $(this).data('color');
            var font = $(this).data('font');
            var bottom_color = $(this).data('bottom_color');

            if (!font) {
                font = '#000';
            }

            if (bottom_color && bottom_color !== "undefined") {
                $('#bottom_tool_bar_ul').find('li').css('color', bottom_color);
            } else {
                $('#bottom_tool_bar_ul').find('li').css('color', '#a9a9a9');
            }
            $('body').css('background-color', color);
            $('.m-read-content').css('color', font);

            Util.StorageSetter('bottom_color', bottom_color);
            Util.StorageSetter('background_color', color);
            Util.StorageSetter('font_color', font);
            
            var fontColor = Util.StorageGetter('font_color');
        });

        // 屏幕滚动事件
        Win.scroll(function(){
            Dom.bottom_nav.hide();
            Dom.top_nav.hide();
            Dom.font_container.hide();
            Dom.font_button.removeClass('current');
            Util.StorageSetter('font_size',initFontSize);
        });
    }
    
    // TODO 整个项目的入口函数
    function main(){
        EventHandler();
    }
    
    main();    
})();