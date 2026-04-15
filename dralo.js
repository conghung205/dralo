Dralo.elements = [];

function Dralo(options = {}) {
    this.opt = Object.assign(
        {
            closeMethods: ["button", "overlay", "escape"],
            footer: false,
            cssClass: [],
            destroyOnclose: true,
        },
        options,
    );

    this.template = document.querySelector(`#${this.opt.templateId}`);

    if (!this.template) {
        console.error(`#${this.opt.templateId} does not exits!`);
        return;
    }

    // kiểm tra closeMethods truyền gì nhiều
    const { closeMethods } = this.opt;
    this._allowButtonClose = closeMethods.includes("button");
    this._allowBackdropClose = closeMethods.includes("overlay");
    this._allowEscapeClose = closeMethods.includes("escape");
    this._footerButtons = [];

    this._handleEscapeKey = this._handleEscapeKey.bind(this);
}

Dralo.prototype._build = function () {
    // sao chép node
    const content = this.template.content.cloneNode(true);

    // create modal elements
    this._backdrop = document.createElement("div");
    this._backdrop.className = "dralo__backdrop";

    const container = document.createElement("div");
    container.className = "dralo__container";

    // class custom
    this.opt.cssClass.forEach((className) => {
        if (typeof className === "string") {
            container.classList.add(className);
        }
    });

    // nếu có alow button
    if (this._allowButtonClose) {
        const button = this._createButton("&times;", "dralo__close", () =>
            this.close(),
        );

        container.append(button);
    }

    const modalContent = document.createElement("div");
    modalContent.className = "dralo__content";

    // Append content and elements
    modalContent.append(content);
    container.append(modalContent);

    // Nếu có footer: true
    if (this.opt.footer) {
        this._modalFooter = document.createElement("div");
        this._modalFooter.className = "dralo__footer";

        this._renderFooterContent();
        this._renderFooterButtons();
        container.appendChild(this._modalFooter);
    }

    this._backdrop.append(container);
    document.body.append(this._backdrop);
};

Dralo.prototype.setFooterContent = function (html) {
    this._footerContent = html;
    this._renderFooterContent();
};

Dralo.prototype.addFooterButton = function (title, cssClass, callback) {
    const button = this._createButton(title, cssClass, callback);
    this._footerButtons.push(button);

    this._renderFooterButtons();
};

Dralo.prototype._renderFooterContent = function () {
    if (this._modalFooter && this._footerContent) {
        this._modalFooter.innerHTML = this._footerContent;
    }
};

Dralo.prototype._renderFooterButtons = function () {
    if (this._modalFooter) {
        this._footerButtons.forEach((button) => {
            this._modalFooter.append(button);
        });
    }
};

Dralo.prototype._createButton = function (title, cssClass, callback) {
    const button = document.createElement("button");
    button.className = cssClass;
    button.innerHTML = title;
    button.onclick = callback;

    return button;
};

Dralo.prototype.open = function () {
    Dralo.elements.push(this);

    if (!this._backdrop) {
        this._build();
    }

    //khi gọi method openModal sẽ add class "show"
    setTimeout(() => {
        this._backdrop.classList.add("dralo--show");
    }, 0);

    // Disable scrolling
    document.body.classList.add("dralo--no-scroll");
    document.body.style.paddingRight = this._getScrollBarWidth() + "px";

    // attach event listeners
    if (this._allowBackdropClose) {
        this._backdrop.onclick = (event) => {
            if (event.target === this._backdrop) {
                this.close();
            }
        };
    }

    // nếu allow Escape
    if (this._allowEscapeClose) {
        document.addEventListener("keydown", this._handleEscapeKey);
    }

    this._onTransitionEnd(this.opt.onOpen);

    return this._backdrop;
};

Dralo.prototype._handleEscapeKey = function (event) {
    const lastModal = Dralo.elements[Dralo.elements.length - 1];
    if (event.key === "Escape" && this === lastModal) {
        this.close();
    }
};

Dralo.prototype._onTransitionEnd = function (callback) {
    this._backdrop.ontransitionend = (e) => {
        if (e.propertyName !== "transform") return;
        if (typeof callback === "function") callback();
    };
};

// close modal
Dralo.prototype.close = function (destroy = this.opt.destroyOnclose) {
    Dralo.elements.pop();

    this._backdrop.classList.remove("dralo--show");

    if (this._allowEscapeClose) {
        document.removeEventListener("keydown", this._handleEscapeKey);
    }

    this._onTransitionEnd(() => {
        if (this._backdrop && destroy) {
            this._backdrop.remove();
            this._backdrop = null;
            this._modalFooter = null;
            this._footerButtons = [];
        }

        // Enable scrolling
        if (!Dralo.elements.length) {
            document.body.classList.remove("dralo--no-scroll");
            document.body.style.paddingRight = "";
        }

        if (typeof this.opt.onClose === "function") {
            this.opt.onClose();
        }
    });
};

Dralo.prototype.destroy = function () {
    this.close(true);
};

Dralo.prototype._getScrollBarWidth = function () {
    if (this._scrollBarWidth) return this._scrollBarWidth;

    const div = document.createElement("div");
    Object.assign(div.style, {
        overflow: "scroll",
        position: "absolute",
        top: "-9999px",
    });

    document.body.appendChild(div);
    this._scrollBarWidth = div.offsetWidth - div.clientWidth;

    // sau khi tính xong là xóa div
    document.body.removeChild(div);

    return this._scrollBarWidth;
};
