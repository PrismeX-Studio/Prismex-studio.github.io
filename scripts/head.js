//set page title
var pgnme = document.title;
var wbnmestr = "PrismeX Studio";
var pgtitle = pgnme.concat(" - ", wbnmestr);
document.title = pgtitle;

//add mobile support
var meta = document.createElement('meta');
meta.name = "viewport";
meta.content = "width=device-width, initial-scale=1.0";
document.getElementsByTagName('head')[0].appendChild(meta);

//set min-width
var style = document.createElement('style');
style.textContent = `html { min-width: 480px; }`;
document.head.appendChild(style);

//Load basic styles
const styleFiles = ["root", "attribute", "theme", "elements", "deco"];
function loadStyle(url) {
    var link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = url;
    var head = document.getElementsByTagName('head')[0];
    head.appendChild(link);
}
// Load CSS
for (let i = 0; i < styleFiles.length; i++) {
    loadStyle("../styles/" + styleFiles[i] + ".css");
}
//public css paths for components
const ALL_COMMON_CSS_PATHS = styleFiles.map(file => `../styles/${file}.css`);


//set title
function addFavicon() {
    const link = document.createElement('link');
    link.rel = 'shortcut icon';
    link.href = '../images/PrismeX-Studio-Icon-Small.png';
    const head = document.head || document.getElementsByTagName('head')[0];
    if (head) {
        head.appendChild(link);
        console.log("Favicon link added to the head.");
    } else {
        console.error("Could not find the <head> element to add the favicon.");
    }
}
// 在 DOM 加载完成后调用此函数
document.addEventListener('DOMContentLoaded', addFavicon);


// =================================================================
// 1. 公用基类 (BaseComponent)
// 【核心原理】负责处理所有组件共同的初始化步骤：创建影子 DOM 和加载模板。
// =================================================================

class BaseComponent extends HTMLElement {
    constructor() {
        super(); // 必须调用父类的构造函数
        this.attachShadow({ mode: 'open' }); // 创建 Shadow DOM

        this._loadCommonCss();

        this._stampTemplate(); // 附加模板内容

        // 调用子类特有的逻辑（如果子类覆盖了此方法）
        this.initializeLogic();
    }

    /**
     * 【公用代码】将异步加载的模板内容存储到类上。
     * 当 loadAndRegisterComponent 成功读取模板后，会调用此方法。
     */
    static setTemplate(templateElement) {
        this.template = templateElement;
    }

    /**
     * 【公用代码】将存储的模板内容克隆一份并放入当前组件实例的 Shadow DOM 中。
     */
    _stampTemplate() {
        const componentClass = this.constructor; // 获取当前实例的类

        if (componentClass.template) {
            // 克隆模板内容并追加到 Shadow Root
            const content = componentClass.template.content.cloneNode(true);
            this.shadowRoot.appendChild(content);
        }
        // 注意：<slot> 标签在这个时候已经生效，会开始监听主页面内容。
    }

    _loadCommonCss() {
        const tagName = this.tagName.toLowerCase();
        const definition = COMPONENT_REGISTRY[tagName];
        // 获取组件配置中指定的路径数组
        let cssPathsToLoad = definition ? definition.commonCssPaths : undefined;
        //【默认逻辑】: 如果配置中未指定 commonCssPaths 属性，则使用 ALL_COMMON_CSS_PATHS 作为默认值。
        //    如果配置中明确指定了空数组 []，则不会进入此 if，也不会加载任何文件。
        if (cssPathsToLoad === undefined) {
            cssPathsToLoad = ALL_COMMON_CSS_PATHS;
        }
        // 3. 执行加载
        if (Array.isArray(cssPathsToLoad)) {
            cssPathsToLoad.forEach(cssPath => {
                const link = document.createElement('link');
                link.setAttribute('rel', 'stylesheet');
                link.setAttribute('href', cssPath);

                this.shadowRoot.appendChild(link);
            });
        }
    }

    /**
     * 【核心代码入口】子类必须覆盖此方法，以实现各自特有的逻辑。
     */
    initializeLogic() {
        // 默认实现为空，不报错即可。
    }
}


// =================================================================
// 2. 特殊组件类 (MyCardComponent)
// 【核心原理】继承基类，覆盖 initializeLogic() 来实现自定义的业务逻辑。
// =================================================================

class NavbarComponent extends BaseComponent {
    initializeLogic() {
        const shadow = this.shadowRoot;

        shadow.querySelector(".back-to-top-container").addEventListener("click", function (event) {
            //event.preventDefault(); // Prevent the default anchor behavior
            console.log("scrolled to top.");
            document.querySelector("body").scrollTo({ top: 0, behavior: "smooth" });
        });
    }
}

class FooterComponent extends BaseComponent {
    initializeLogic() {

    }
}

//AppPlaceholderComponent
class AppPlaceholderComponent extends BaseComponent {

    initializeLogic() {
        const shadow = this.shadowRoot;

        //根据状态属性修改样式
        const status = this.getAttribute('status') || 'loading';

        if (status === 'error') {
            const placeholderDiv = shadow.querySelector('.placeholder');
            if (placeholderDiv) {
                placeholderDiv.style.borderColor = 'var(--primary-color)';
            }
        }
    }
}

class TopPanelComponent extends BaseComponent {
    initializeLogic() {
        const shadow = this.shadowRoot;
        const title = this.getAttribute('title') || 'UNABLE TO GET TITLE!!!';
        const subTitle = this.getAttribute('sub-title') || 'UNABLE TO GET SUB-TITLE!!!';

        const titleEl = shadow.querySelector('.top-title>placeholder');
        const subTitleEl = shadow.querySelector('.top-sub-title');

        titleEl.textContent = title;
        subTitleEl.textContent = subTitle;
    }
}


/**
 * TitleblockComponent 类
 * 继承 BaseComponent，用于实现标题块组件的逻辑。
 */
class TitleblockComponent extends BaseComponent {
    initializeLogic() {
        const shadow = this.shadowRoot;

        // 从 HTML 标签中读取属性值
        const titleText = this.getAttribute('text');
        const subtitleText = this.getAttribute('sub-title');
        // tags 属性需要进行 JSON 解析，且需处理单引号和空值
        const tagsAttr = this.getAttribute('tags');
        const iconSrc = this.getAttribute('icon') || "../icons/AlertRhombus.svg"; // 默认图标

        let tags = [];
        if (tagsAttr) {
            try {
                // 1. 将单引号替换为双引号，以符合标准 JSON 格式
                const cleanJsonString = tagsAttr.replace(/'/g, '"');
                // 2. 解析 JSON 字符串为数组
                tags = JSON.parse(cleanJsonString);
            } catch (e) {
                console.error(`TitleblockComponent: 标签属性 tags 解析失败`, e);
            }
        }

        //填充主/副标题和图标

        //填充标题
        const h1 = shadow.querySelector('h1');
        if (h1 && titleText) {
            h1.textContent = titleText;
        }

        // 填充副标题
        const h2 = shadow.querySelector('h2');
        if (h2 && subtitleText) {
            h2.textContent = subtitleText;
        }

        // 填充图标
        const iconElement = shadow.querySelector('.icon-title');
        if (iconElement) {
            iconElement.setAttribute('src', iconSrc);
        }

        // 动态创建和填充标签
        const tagsContainer = shadow.querySelector('.t-tags-container');
        if (tagsContainer) {
            // 清空模板中可能存在的占位内容
            tagsContainer.innerHTML = '';

            if (Array.isArray(tags) && tags.length > 0) {
                tags.forEach(tag => {
                    const tagElement = document.createElement('p');
                    tagElement.textContent = tag;
                    tagsContainer.appendChild(tagElement);
                });
            }
        }
    }
}


//StopSupportInfoComponent
class StopSupportInfoComponent extends BaseComponent {

    initializeLogic() {
        const shadow = this.shadowRoot;

        const lastUpdateDate = this.getAttribute('last-update') || '2020-1-1';

        // 计算天数差
        var today = new Date();
        var lastUpdate = new Date(lastUpdateDate);
        var timeDiff = today.getTime() - lastUpdate.getTime();
        var daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

        // 加载HTML内容
        const contentP = shadow.querySelector('p');
        var data = contentP.textContent;
        var updatedContent = data
            .replace('%last-update-date', lastUpdateDate)
            .replace('%days', daysDiff);
        // 将处理后的内容插入到元素中
        contentP.textContent = updatedContent;
    }
}

class GridPanelBaseComponent extends BaseComponent {
    initializeLogic() {
    }
}
class decoSepratorBaseComponent extends BaseComponent {
    initializeLogic() {
    }
}


class GridPanelContentPanelComponent extends BaseComponent {

    initializeLogic() {

        const shadow = this.shadowRoot;

        // 1. 获取 DOM 引用
        const iconContainer = shadow.getElementById('icon-slot');
        const titleEl = shadow.getElementById('title-text');
        const subtitleEl = shadow.getElementById('subtitle-text');

        // 2. 从 Attribute 获取数据
        const iconSrc = this.getAttribute('icon') || "../icons/AlertRhombus.svg";
        const title = this.getAttribute('title') || "TITLE";
        const subTitle = this.getAttribute('sub-title') || "Sub Description";

        // 3. 渲染数据
        titleEl.textContent = title;
        subtitleEl.textContent = subTitle;

        // 4. 处理图标：如果是 SVG 代码则直接注入，如果是路径则创建 img
        this._renderIcon(iconContainer, iconSrc);
    }

    _renderIcon(container, src) {
        if (!src) return;

        // 判断是否为内联 SVG 字符串
        if (src.trim().startsWith('<svg')) {
            // 如果是内联SVG，清除Mask背景，直接填入HTML
            container.style.webkitMaskImage = 'none';
            container.style.maskImage = 'none';
            container.innerHTML = src;

            // 确保内部SVG也遵循父级的颜色
            const svgEl = container.querySelector('svg');
            if (svgEl) svgEl.style.fill = 'currentColor';
        } else {
            // 如果是路径 URL，应用 Mask 遮罩
            container.innerHTML = ''; // 清空
            const maskValue = `url("${src}")`;
            container.style.webkitMaskImage = maskValue;
            container.style.maskImage = maskValue;
        }
    }
}


class HomeNavigationPanelComponent extends BaseComponent {
    initializeLogic() {

    }
}


class DevNavigationContentPanelComponent extends BaseComponent {
    initializeLogic() {
        const shadow = this.shadowRoot;

        const titleEl = shadow.getElementById('title-text');
        const subtitleEl = shadow.getElementById('subtitle-text');
        const hrefE1 = shadow.getElementById('card-link');

        const href = this.getAttribute('href') || "../icons/AlertRhombus.svg";
        const title = this.getAttribute('title') || "TITLE";
        const subTitle = this.getAttribute('sub-title') || "Sub Description";
        //todo: tag-text,accent-color

        titleEl.textContent = title;
        subtitleEl.textContent = subTitle;
        hrefE1.href = href
    }
}

class UnderConstructionInfoComponent extends BaseComponent {
    //弃用，保留以备未来可能的使用
    initializeLogic() {
        const shadow = this.shadowRoot;

        // 获取 DOM 引用
        const elements = {
            title: shadow.getElementById('main-title'),
            subtitle: shadow.getElementById('sub-title'),
            start: shadow.getElementById('val-start'),
            stage: shadow.getElementById('val-stage'),
            elapsed: shadow.getElementById('val-elapsed'),
            eta: shadow.getElementById('val-eta')
        };

        // 获取属性值 (设置默认值)
        const config = {
            title: this.getAttribute('title') || "UNDER CONSTRUCTION",
            subtitle: this.getAttribute('sub-title') || "DEVELOPMENT MODE",
            startDate: this.getAttribute('start-date') || "2023-01-01",
            stage: this.getAttribute('stage') || "PHASE 1 (CORE)",
            eta: this.getAttribute('eta') || "TBD",
            accentColor: this.getAttribute('accent-color') || "#f39c12"
        };

        // 更新基础文本
        elements.title.textContent = config.title;
        elements.subtitle.textContent = config.subtitle;
        elements.start.textContent = config.startDate;
        elements.stage.textContent = config.stage;
        elements.eta.textContent = config.eta;

        // 设置主题色
        if (this.getAttribute('accent-color')) {
            this.style.setProperty('--theme-color', config.accentColor);
        }

        // 动态计算已开发时间逻辑
        const updateElapsed = () => {
            const start = new Date(config.startDate);
            const now = new Date();
            const diff = now - start;

            if (isNaN(diff)) {
                elements.elapsed.textContent = "INVALID DATE";
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const mins = Math.floor((diff / (1000 * 60)) % 60);

            elements.elapsed.textContent = `${days}D ${hours.toString().padStart(2, '0')}H ${mins.toString().padStart(2, '0')}M`;
        };

        updateElapsed();
        // 每分钟更新一次已耗时
        this.timer = setInterval(updateElapsed, 60000);
    }

    // 断开连接时清理定时器
    disconnectedCallback() {
        if (this.timer) clearInterval(this.timer);
    }
}

class SearchResultCardComponent extends BaseComponent {
    initializeLogic() {
        const shadow = this.shadowRoot;

        const elements = {
            title: shadow.querySelector('.title'),
            subTitle: shadow.querySelector('.sub-title'),
            author: shadow.querySelector('.author'),
            time: shadow.querySelector('.time'),
            tagsContainer: shadow.querySelector('.search-tags-container'),
            cardContainer: shadow.querySelector('.card-container')
        };

        const data = {
            title: this.getAttribute('title') || "Untitled",
            subTitle: this.getAttribute('sub-title') || "",
            author: this.getAttribute('author') || "Unknown",
            time: this.getAttribute('time') || "Recently",
            href: this.getAttribute('href') || "#",
            tagsRaw: this.getAttribute('tags')
        };

        let tags = [];
        if (data.tagsRaw) {
            try {
                const formattedJson = data.tagsRaw.replace(/'/g, '"');
                tags = JSON.parse(formattedJson);
            } catch (e) {
                console.warn("SearchResultCard: Tags parsing failed.", e);
            }
        }

        if (elements.title) elements.title.textContent = data.title;
        if (elements.subTitle) elements.subTitle.textContent = data.subTitle;
        if (elements.author) elements.author.textContent = data.author;
        if (elements.time) elements.time.textContent = data.time;

        //动态渲染标签
        if (elements.tagsContainer && Array.isArray(tags)) {
            elements.tagsContainer.innerHTML = ''; // 清空可能存在的占位符
            tags.forEach(tag => {
                const tagEl = document.createElement('span');
                tagEl.className = 'search-tag';
                tagEl.textContent = tag;
                elements.tagsContainer.appendChild(tagEl);
            });
        }

        if (elements.cardContainer) {
            elements.cardContainer.style.cursor = 'pointer';
            elements.cardContainer.onclick = () => {
                window.location.href = data.href;
            };
        }
    }
}

class InfoBoxComponent extends BaseComponent {
    initializeLogic() {
        const shadow = this.shadowRoot;
        const type = this.getAttribute('type') || 'warn';
        const title = this.getAttribute('title') || 'WARNING: INVALID TYPE';

        const container = shadow.querySelector('.prismex-info-box');
        const titleEl = shadow.querySelector('.info-title');
        if (container) container.classList.add(type);
        if (titleEl) titleEl.textContent = title;
    }
}

class ImageBoxComponent extends BaseComponent {
    initializeLogic() {
        const shadow = this.shadowRoot;
        const src = this.getAttribute('src') || '../icons/AlertRhombus.svg';
        const title = this.getAttribute('title') || '未命名 / UNNAMED';
        const mxwidth = this.getAttribute('maxWidth');
        const float = this.getAttribute('float') || "none";
        const sizing = this.getAttribute('sizing') || "none";

        const imageEl = shadow.querySelector('.image-box-img');
        const titleEl = shadow.querySelector('.image-text');
        const container = shadow.querySelector('.image-box');

        switch (sizing) {
            case "fit-size":
                //保持比例
                Object.assign(imageEl.style, {
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                });
                break;

            case "fixed-size":
                // 保持原始像素尺寸
                Object.assign(imageEl.style, {
                    width: 'auto',
                    height: 'auto',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain'
                });

                break;

            case "stretch":
                /**
                 * 强制拉伸图片以适应容器宽度
                 * 如果容器宽度小于图片原始宽度，强制宽度撑满容器，但保持高度为原始高度
                 * 注意：这会导致图片比例失真
                 */
                Object.assign(imageEl.style, {
                    width: '100%',
                    height: '100%',
                    objectFit: 'fill'
                });
                break;

            default:
                console.warn(`未知的尺寸类型: ${sizing}`);
                break;
        }

        if (imageEl) {
            imageEl.src = src;
            imageEl.onerror = () => {
                imageEl.style.display = 'none';
                shadow.querySelector('.image-error').style.display = 'block';
                shadow.querySelector('.image-error-text').style.display = 'block';
            };
        }

        if (float == "left" || float == "Left") {
            container.style.float = "left";
            container.style.marginRight = "1.4rem"; // 浮动时添加右边距
        } else if (float == "right" || float == "Right") {
            container.style.float = "right";
            container.style.marginLeft = "1.4rem"; // 浮动时添加左边距
        }

        if (titleEl) {
            titleEl.textContent = title;
        }

        if (container && mxwidth) {
            container.style.maxWidth = mxwidth;
        }
    }
}


// =================================================================
// 组件注册表：定义所有组件的标签名、模板路径和处理它们的类
// =================================================================
// 如果没有复杂逻辑，可直接用基类
// 默认加载全部公共css,即ALL_COMMON_CSS_PATHS
// 设置为空[]则不加在任何公共css
const COMPONENT_REGISTRY = {
    'app-navbar': {
        path: '[component]navbar.html',
        componentClass: NavbarComponent,
        commonCssPaths: ALL_COMMON_CSS_PATHS
    }, 'app-footer': {
        path: '[component]footer.html',
        componentClass: FooterComponent,
        commonCssPaths: ALL_COMMON_CSS_PATHS
    }, 'top-panel': {
        path: '[component]top-panel.html',
        componentClass: TopPanelComponent,
        commonCssPaths: ALL_COMMON_CSS_PATHS
    }, 'title-block': {
        path: '[component]titleblock.html',
        componentClass: TitleblockComponent,
        commonCssPaths: ALL_COMMON_CSS_PATHS
    },
    'deco-seprator': {
        path: '[component]deco-seprator.html',
        componentClass: decoSepratorBaseComponent,
        commonCssPaths: ALL_COMMON_CSS_PATHS
    },
    //wait for update
    'stop-supporting-info': {
        path: '[component]stop-supporting-info.html',
        componentClass: StopSupportInfoComponent,
        commonCssPaths: ALL_COMMON_CSS_PATHS
    },
    //search(contents.html)
    'search-result-card': {
        path: '[component]search-result-card.html',
        componentClass: SearchResultCardComponent,
        commonCssPaths: ALL_COMMON_CSS_PATHS
    },
    //old homepage components
    'grid-panel': {
        path: '[component]grid-panel.html',
        componentClass: GridPanelBaseComponent,
        commonCssPaths: ALL_COMMON_CSS_PATHS
    },
    'content-panel': {
        path: '[component]g-p-content-panel.html',
        componentClass: GridPanelContentPanelComponent,
        commonCssPaths: ALL_COMMON_CSS_PATHS
    },
    'dev-navigation-panel': {
        path: '[component]dev-navigation-panel.html',
        componentClass: HomeNavigationPanelComponent,
        commonCssPaths: ALL_COMMON_CSS_PATHS
    },
    'dev-navigation-content-panel': {
        path: '[component]dev-navigation-content-panel.html',
        componentClass: DevNavigationContentPanelComponent,
        commonCssPaths: ALL_COMMON_CSS_PATHS
    },
    'info-box': {
        path: '[component]info-box.html',
        componentClass: InfoBoxComponent,
        commonCssPaths: ALL_COMMON_CSS_PATHS
    },
    'image-box': {
        path: '[component]image-box.html',
        componentClass: ImageBoxComponent,
        commonCssPaths: ALL_COMMON_CSS_PATHS
    }
};



// =================================================================
// 4. 异步加载与注册主流程
// 【核心原理】驱动整个系统运行，确保在组件被使用前，它们已被定义和加载。
// =================================================================

/**
 * 【主流程函数】加载模板文件，并将模板内容注册到对应的 Class 上，然后注册 Custom Element。
 */
async function loadAndRegisterComponent(tagName, definition) {
    const { path, componentClass } = definition;

    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`Failed to fetch: ${path}`);
        const templateText = await response.text();

        //删除debug时live server可能添加的错误脚本


        // --- 使用更健壮的 DOMParser ---
        const parser = new DOMParser();
        const doc = parser.parseFromString(templateText, 'text/html');
        const scripts = doc.querySelectorAll('script');
        scripts.forEach(script => script.remove());
        const template = doc.querySelector('template');

        if (!template) {
            console.error(`[${tagName}] 错误: 未能在文件中找到 <template> 标签`);
            return;
        }

        // --- 诊断：检查模板内容是否完整 ---
        const contentChildren = template.content.querySelectorAll('*').length;
        console.log(`[${tagName}] 模板解析完成，内部元素数量:`, contentChildren);

        if (contentChildren < 5) { // 如果元素太少，说明被截断了
            console.warn(`[${tagName}] 警告: 模板内容可能被截断，请检查文件编码或非法字符。`);
        }

        componentClass.setTemplate(template);

        if (!customElements.get(tagName)) {
            customElements.define(tagName, componentClass);
        }

    } catch (error) {
        console.error(`[${tagName}] 注册失败:`, error);
    }
}

// 入口函数
async function loadAllComponents() {
    console.log("Starting component batch registration...");
    // 遍历注册表为每个组件启动异步加载流程
    const registrationPromises = Object.entries(COMPONENT_REGISTRY).map(([tagName, definition]) => {
        return loadAndRegisterComponent(tagName, definition);
    });
    // 等待所有组件注册完成
    await Promise.all(registrationPromises);

    console.log("All components registered.");
}
// 页面DOM加载完成后开始执行组件的加载和注册
document.addEventListener('DOMContentLoaded', loadAllComponents);