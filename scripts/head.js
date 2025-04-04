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
document.write("        <link rel=\"shortcut icon\" href=\"..\/images\/wicon.png\">");
//pagename
var pgnme = getComputedStyle(document.documentElement).getPropertyValue('--pagename');
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
//title module support
$(function () {
    $(".title[text][author][tags]").each(function () {
        var $element = $(this);
        var text = $element.attr("text");
        var author = $element.attr("author");
        var tags = JSON.parse($element.attr("tags").replace(/'/g, '"'));
        var icon = $element.attr("icon") || "../icons/FluentWarningFilled.svg";

        $element.load("title.html", function (response, status, xhr) {
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
            $element.find("h2").text(author);
            $element.find(".icon-title").attr("src", icon);
        });
    });
});