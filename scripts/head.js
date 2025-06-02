function loadStyle(url) {
    var link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = url;
    var head = document.getElementsByTagName('head')[0];
    head.appendChild(link);
}

// Load CSS
const styleFiles = ["root", "attribute", "theme", "title", "elements"];
for (let i = 0; i < styleFiles.length; i++) {
    loadStyle("../styles/" + styleFiles[i] + ".css");
}
//icon
document.write("        <link rel=\"shortcut icon\" href=\"..\/images\/PrismeX-Studio-Icon-Small.png\">");
//pagename

//!!!重要更改：全局css变量pagename已经弃用!!!

var pgnme = document.title;
var wbnmestr = "PrismeX Studio";
var pgtitle = pgnme.concat(" - ", wbnmestr);
document.title = pgtitle;
//include support
$(function () {
    $(".include[file]").each(function () {
        var $element = $(this);
        $element.load($element.attr("file"), function () {
            $element.replaceWith($element.children());
        });
    });
});

//set language
document.querySelector("html").lang="zh-CN";

//title module support
$(function () {
    $(".title[text][sub-title][tags]").each(function () {
        var $element = $(this);
        var text = $element.attr("text");
        var subtitle = $element.attr("sub-title");
        var tags = JSON.parse($element.attr("tags").replace(/'/g, '"'));
        var icon = $element.attr("icon") || "../icons/AlertRhombus.svg";

        $element.load("_title.html", function (response, status, xhr) {
            if (status === "error") {
                console.error("加载失败:", xhr.statusText);
                return;
            }

            // ！！关键修正！！ 直接操作已加载的DOM
            var $container = $element.find(".t-tags-container");
            
            if ($container.length === 0) {
                console.error("错误：未找到 .t-tags-container");
                console.log("当前HTML结构:", $element.html());
                return;
            }

            // 清空并重建标签
            $container.empty();
            tags.forEach(function(tag) {
                $container.append($("<p>").text(tag));
            });

            // 设置其他元素
            $element.find("h1").text(text);
            $element.find("h2").text(subtitle);
            $element.find(".icon-title").attr("src", icon);
        });
    });
});

//停止支持信息模板
$(document).ready(function() {
    // 遍历所有具有stop-supporting-info类的元素
    $('.stop-supporting-info').each(function() {
        var lastUpdateDate = $(this).attr('last-update');
        
        // 计算天数差
        var today = new Date();
        var lastUpdate = new Date(lastUpdateDate);
        var timeDiff = today.getTime() - lastUpdate.getTime();
        var daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
        
        // 加载HTML内容
        var element = $(this);
        $.get('element.stop-supporting-info.html', function(data) {
            // 替换占位符
            var updatedContent = data
                .replace('%last-update-date', lastUpdateDate)
                .replace('%days', daysDiff);
            
            // 将处理后的内容插入到元素中
            element.html(updatedContent);
        }).fail(function() {
            console.error('无法加载停止支持信息模板');
        });
    });
});