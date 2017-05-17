
(function(){
    var Util = (function(){
        var prefix = 'html5_reader_';  // prefix 前缀
        var StorageGetter = function(key) {
            return localStorage.getItem(prefix + key);
        }
        var StorageSetter = function(key, val) {
            return localStorage.setItem(prefix + key, val);
        }
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
        }
        return {
            getBSONP : getBSONP,
            StorageGetter : StorageGetter,
            StorageSetter : StorageSetter
        }
    })();
    
    // dom节点的缓存
    var Dom = {
        top_nav :$('#top-nav'),
        bottom_nav :$('.bottom_nav'),
        font_container : $('.font-container'),
        font_button: $('#font-button'),
        night_button : $('#night-button'),
        bk_container : $('#bk-container'),
        bottom_tool_bar : $('#bottom_tool_bar'),
        bk_ul : $('.bk-container'),
        // 章节信息
        nav_title : $('#nav_title'),
        next_button : $('#next_button'),
        prev_button : $('#prev_button'),
        back_button : $('#back_button')
        
    }
    var Win = $(window);
    var Doc = $(document);
    var ScrollLock = false;
    var Screen = Doc.body;
    var RootContainer = $('#fiction_container');
    var readerMode, readerUI;
    
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
        fontColor == '#4e534f';
    }
    RootContainer.css('font-color',fontColor);
        
    //是否是夜间模式
    var NightMode = false;
    
    // 获取各类颜色值
    var tool_bar = Util.StorageGetter('toolbar_background_color');
    var bottomcolor = Util.StorageGetter('bottom_color'); 
    var color = Util.StorageGetter('background_color');
    var font = Util.StorageGetter('font_color');

    RootContainer.css('min-height', $(window).height() - 100);
    if (bottomcolor) {
        $('#bottom_tool_bar_ul').find('li').css('color', bottomcolor);
    }
    if (color) {
        $('body').css('background-color', color);
    }
    if (font) {
        $('.m-read-content').css('color', font);
    }
    //夜间模式
    if (fontColor == '#4e534f') {
        NightMode = true;
        $('#day_icon').show();
        $('#night_icon').hide();
        $('#bottom_tool_bar_ul').css('opacity', '0.6');
    }
    //字体设置信息
    InitFontSize = Util.StorageGetter('font_size');
    InitFontSize = parseInt(InitFontSize);
    if (!InitFontSize) {
        InitFontSize = 18;
    }
    RootContainer.css('font-size', InitFontSize);
    // 可设置背景颜色选项
    var colorArr = [{
        value : '#e9dfc7',
        name : 'default',
        font : ''
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
        bottomcolor : '#fff'
    }];
           
    // TODO 实现和阅读器相关的数据交互的方法
    // AJAX, JSONP
    function ReaderModel(){
        // 获得章节列表
        var Chapter_id;
        var ChapterTotal;
        var init = function(UIcallback){
            getFictionInfo(function(){
                getCurChapterContent(Chapter_id, function(data){
                    // TODO .....
                    UIcallback && UIcallback(data);
                });
            });
        }
        var getFictionInfo = function(callback){
            $.get('data/chapter.json', function(data){
                // TODO 获得章节信息后的回调
                Chapter_id = data.chapters[1].chapter_id;
                ChapterTotal = data.chapters.length;
                callback && callback();
            }, 'json');
        }
        var getCurChapterContent = function(chapter_id, callback){
            $.get('data/data' + chapter_id + '.json', function(data){
                // TODO 获得段落信息后的回调
                // 检查服务器状态
                if(data.result == 0){
                    var url = data.jsonp;
                    Util.getBSONP(url, function(data){
                        callback && callback(data);
                    });
                }
            }, 'json');
        }
        var preChapter = function(UIcallback){
            // 获得上一章节内容
            Chapter_id = parseInt(Chapter_id, 10);
            if(Chapter_id == 0){
                return;
            }
            Chapter_id -= 1;
            getCurChapterContent(Chapter_id, UIcallback);
        }
        var nextChapter = function(chapter_id){
            // 获得下一章节内容
            Chapter_id = parseInt(Chapter_id, 10);
            if(Chapter_id == ChapterTotal){
                return;
            }
            Chapter_id += 1;
            getCurChapterContent(Chapter_id, UIcallback);
        }
        return {
            init : init,
            preChapter : preChapter,
            nextChapter : nextChapter
        }
        
    }
    
    function ReaderBaseFrame(container){
        // 渲染基本的UI结构
        function parseChapterData(jsonData){
            var jsonObj = JSON.parse(jsonData);
            var html = '<h4>' + jsonObj.t + '</h4>';
            for(var i=0; i<jsonObj.p.length; i++){
                html += "<p>" + jsonObj.p[i] + "</p>"
            }
            return html;
        }
        return function(data){
            container.html(parseChapterData(data));
        }
    }
    
    // 交互的事件绑定
    function EventHandler(){
            
        // 屏幕唤出上下边栏交互
        $('#action_mid').click(function(){
            if(Dom.top_nav.css('display') == 'none'){
                Dom.bottom_nav.show();
                Dom.top_nav.show();
            }else{
                Dom.bottom_nav.hide();
                Dom.top_nav.hide();
            }
        });
        
        // 唤出字体面板交互
        Dom.font_button.click(function(){
            if(Dom.font_container.css('display') == 'none'){
                Dom.font_container.show();
                Dom.font_button.addClass('current');
            }else{
                Dom.font_container.hide();
                Dom.font_button.removeClass('current');
            }
        });
        $('#action_mid').click(function(){
            if(Dom.font_container.css('display') == 'none'){
                return;
            }else{
                Dom.font_container.hide();
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
            var bottomcolor = $(this).data('bottomcolor');
            // var bkListsNum = $('#bk-container').find('li');
            var tool_bar = font;
            var tool_bar = Util.StorageGetter('font_color');
            console.log("*****" + bottomcolor);
            if (!font) {
                font = '#000';
            }
            if (!tool_bar) {
                tool_bar = '#fbfcfc';
            }

            if (bottomcolor && bottomcolor != "undefined") {
                $('#bottom_tool_bar_ul').find('li').css('color', bottomcolor);
            } else {
                $('#bottom_tool_bar_ul').find('li').css('color', '#a9a9a9');
            }
            $('body').css('background-color', color);
            $('.m-read-content').css('color', font);

            Util.StorageSetter('toolbar_background_color', tool_bar);
            Util.StorageSetter('bottom_color', bottomcolor);
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
        
        Dom.prev_button.click(function(){
            // TODO 获得章节的翻页数据->把数据拿出来渲染
            readerMode.prevChapter(function(data){
                readerUI(data);
            });
        });
        
        Dom.next_button.click(function(){
            readerMode.nextChapter(function(data){
                readerUI(data);
            });
        });
    }
    
    // TODO 整个项目的入口函数
    function main(){
        readerModel = ReaderModel();
        readerUI = ReaderBaseFrame(RootContainer);
        readerModel.init(function(data){
            readerUI(data);
        });
        EventHandler();
    }
    
    main();    
})();