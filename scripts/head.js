document.write("        <link rel=\"shortcut icon\" href=\"..\/images\/wicon.png\">");
var pgnme = getComputedStyle(document.documentElement).getPropertyValue('--pagename');
        var wbnmestr = "PrismeX Studio";
        var pgtitle = pgnme.concat(" - ", wbnmestr);
        document.title = pgtitle;
        document.write("        <link rel=\"shortcut icon\" href=\"..\/images\/wicon.png\">");
        $(function () {
            $(".include[file]").each(function () {
                var $element = $(this);
                $element.load($element.attr("file"), function () {
                    $element.replaceWith($element.children());
                });
            });
        });
//light/dark
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.write("        <link href=\"..\/styles\/-dark.css\" rel=\"stylesheet\">");
} else {
    document.write("        <link href=\"..\/styles\/-light.css\" rel=\"stylesheet\">");
}