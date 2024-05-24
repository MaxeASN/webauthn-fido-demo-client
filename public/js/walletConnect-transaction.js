const t = {};

class e extends HTMLElement {
    constructor() {
        super(), this.root = this.attachShadow({mode: "open"}), this._onFormSubmitListener = this._onFormSubmit.bind(this), this.assertionStartUrl = "https://asn.aspark.space/api/transaction/start", this.assertionFinishUrl = "https://asn.aspark.space/api/transaction/finish", this.fetchOptions = {
            method: "POST",
            credentials: "include",
            headers: {"Content-Type": "application/json"}
        }
    }
    symbol = this.getAttribute("symbol");
    amount = this.getAttribute("amount");
    to = this.getAttribute("to");
    from = this.getAttribute("from");
    data = this.getAttribute("data");

    static get observedAttributes() {
        return ["no-username", "label", "input-type", "input-name", "button-text"]
    }

    connectedCallback() {
        this.update();
        //this.root.querySelector("#confirm-button-yes").addEventListener("click", this._onFormSubmitListener);
        // document.getElementById("confirm-button-cancel").addEventListener('click', function (){
        //     document.getElementById("transaction-confirm").setAttribute("style", "z-index: 2012; display: none");
        // })

    }

    disconnectedCallback() {
        this.root.querySelector("#confirm-button-yes").removeEventListener("submit", this._onFormSubmitListener)
    }

    attributeChangedCallback(t, e, n) {
        if (!this.root.innerHTML) return;
        if (n === e) return;
        const i = this.root.querySelector("label"), s = this.root.querySelector("input"),
            r = this.root.querySelector("button");
        switch (t) {
            case"no-username":
                this._shouldUseUsername();
                break;
            case"label":
                i.textContent = n || this.label;
                break;
            case"button-text":
                r.textContent = n || this.buttonText;
                break;
            case"input-type":
                s.type = n || this.inputType;
                break;
            case"input-name":
                s.name = n || this.inputName;
                break;
        }
    }

    update() {
        this.root.innerHTML || (this.root.innerHTML =
            `
            <div class="amount-confirm-text" style="font-weight: bolder;margin-top: 10px;margin-bottom: -10px;color: white">amount：</div>
            <div class="amount" id="amount-confirm" data-v-7bb2b20a="" style="margin-top: 20px;background: #f9f9f9;border-radius: 12px;padding: 10px 20px;font-size: 14px;font-weight: 400;color: #1f202a;line-height: 26px;">${this.amount} ${this.symbol}</div>
            <div class="address-confirm-text" style="font-weight: bolder;margin-top: 10px;margin-bottom: -10px;color: white">from：</div>
            <div class="address" id="address-confirm" data-v-7bb2b20a="" style="margin-top: 20px;background: #f9f9f9;border-radius: 12px;padding: 10px 20px;font-size: 14px;font-weight: 400;color: #1f202a;line-height: 26px;">${this.from}</div>
            <div class="address-confirm-text" style="font-weight: bolder;margin-top: 10px;margin-bottom: -10px;color: white">to：</div>
            <div class="address" id="address-confirm" data-v-7bb2b20a="" style="margin-top: 20px;background: #f9f9f9;border-radius: 12px;padding: 10px 20px;font-size: 14px;font-weight: 400;color: #1f202a;line-height: 26px;">${this.to}</div>
            <div class="data-confirm-text" style="font-weight: bolder;margin-top: 10px;margin-bottom: -10px;color: white">data：</div>
            <div class="data" id="data-confirm" data-v-7bb2b20a="" style="margin-top: 20px;background: #f9f9f9;border-radius: 12px;padding: 10px 20px;font-size: 14px;font-weight: 400;color: #1f202a;line-height: 26px;">${this.data}</div>
            <div class="tips" style="margin-top: 10px;">
                <iconpark-icon icon-id="exclamation-point" class="iconpark icon-exclamation-point icon" name="" size="1em" width="" height=""></iconpark-icon>
                <span style="color: var(--up-primary);font-weight: 500;font-size: 14px;line-height: 20px;">please check whether the above <br>information is correct</span>
            </div>
            <div id="confirm-button" style="margin-top: 20px;">
                <button class="el-button el-button--primary copy up-button copy" id="confirm-button-yes" aria-disabled="false" type="button" data-v-7bb2b20a="" style="
                cursor: pointer;
                width: 30%;
                height: 46px;
                margin-right: 60px;
                margin-left: 28px; 
                font-size: 15px;
                font-weight: 600;
                border-radius: 12px;
                border: none;
                background: linear-gradient(320deg, #8864ff 0, #9a7cff 100%);
                box-shadow: inset 1px 1px 4px 0 hsla(0, 0%, 100%, 0.5)">
                    <span class="" style="color: white;">Confirm</span>
                </button>
                <button class="el-button el-button--primary copy up-button copy el-button-cancel" id="confirm-button-cancel" aria-disabled="false" type="button" data-v-7bb2b20a="" style="
                width: 30%;
                height:46px; 
                background: linear-gradient(320deg, #bdb8d1 0, #bdb8d1 100%); 
                cursor: pointer;
                font-size: 15px;
                font-weight: 600;
                border-radius: 12px;
                border: none;
                box-shadow: inset 1px 1px 4px 0 hsla(0, 0%, 100%, 0.5)">
                    <span class="" style="color: white;">Cancel</span>
                </button>
            </div>
            `)
    }

    get noUsername() {
        return this.hasAttribute("no-username")
    }

    set noUsername(t) {
        t ? this.setAttribute("no-username", "") : this.removeAttribute("no-username")
    }

    get label() {
        return this.getAttribute("label") || "Username"
    }

    set label(t) {
        this.setAttribute("label", t)
    }

    get buttonText() {
        return this.getAttribute("button-text") || "Login"
    }

    set buttonText(t) {
        this.setAttribute("button-text", t)
    }

    get inputType() {
        return this.getAttribute("input-type") || "text"
    }

    set inputType(t) {
        this.setAttribute("input-type", t)
    }

    get inputName() {
        return this.getAttribute("input-name") || "username"
    }

    set inputName(t) {
        this.setAttribute("input-name", t)
    }

    _shouldUseUsername() {
        const t = this.root.querySelector("input"), e = this.root.querySelector("label");
        this.noUsername ? (t.required = !1, t.hidden = !0, e.hidden = !0, t.value = "") : (t.required = !0, t.hidden = !1, e.hidden = !1)
    }

    async _getPublicKeyCredentialRequestOptionsDecoder() {
        if ("function" == typeof this.publicKeyCredentialRequestOptionsDecoder) return this.publicKeyCredentialRequestOptionsDecoder;
        if ("function" == typeof t.publicKeyCredentialRequestOptionsDecoder) return t.publicKeyCredentialRequestOptionsDecoder;
        const {decodePublicKeyCredentialRequestOptions: e} = await import("./utils/parse.js");
        return t.publicKeyCredentialRequestOptionsDecoder = e, t.publicKeyCredentialRequestOptionsDecoder
    }

    async _getLoginCredentialEncoder() {
        if ("function" == typeof this.loginCredentialEncoder) return this.loginCredentialEncoder;
        if ("function" == typeof t.loginCredentialEncoder) return t.loginCredentialEncoder;
        const {encodeLoginCredential: e} = await import("./utils/parse.js");
        return t.loginCredentialEncoder = e, t.loginCredentialEncoder
    }

    async _onFormSubmit(t) {
        try {
            if (t.preventDefault(), !window.PublicKeyCredential) throw new Error("Web Authentication is not supported on this platform");
            this.dispatchEvent(new CustomEvent("login-started"));
            // const e0 = new FormData(t.target).get('coinSelect'), e1 = new FormData(t.target).get('toAddress'), e2 =  new FormData(t.target).get('amount');
            const symbolEnum = this.getSymbolEnum(symbol);
            const n = await fetch(this.assertionStartUrl, {
                ...this.fetchOptions,
                body: JSON.stringify({coin: symbolEnum, fromAddress: this.from, toAddress: this.to, amount: this.amount})
            }), {assertionId: i, publicKeyCredentialRequestOptions: s, requestParams: p} = await n.json();
            if (!n.ok) throw new Error("Could not successfuly start login");
            if(p.toAddress != this.to || p.amount != this.amount || p.fromAddress != this.from) throw new Error("The transaction content has been changed!");
            const r = await this._getPublicKeyCredentialRequestOptionsDecoder(),
                o = await navigator.credentials.get({publicKey: r(s)});
            this.dispatchEvent(new CustomEvent("login-retrieved"));
            const a = await this._getLoginCredentialEncoder(),
                cre = a(o);
                cre.response.userHandle = s.userHandle;
            const u = await fetch(this.assertionFinishUrl, {
                ...this.fetchOptions,
                body: JSON.stringify({assertionId: i, credential: a(o)})
            });
            if (!u.ok) throw new Error("调用接口出错");
            const {code: c, message:m, data:d} = await u.json();
            if (c != 1) {
                throw new Error(m);
            }
            document.getElementById("transaction-confirm").setAttribute("style", "z-index: 2012; display: none");
            alert("交易成功")
            this.dispatchEvent(new CustomEvent("login-finished", {detail: {code: c, message:m, data:d}}))
        } catch (t) {
            console.error("failed:" + t.message)
            this.dispatchEvent(new CustomEvent("login-error", {detail: {message: t.message}}))
        }
    }

    getSymbolEnum(symbol){
        switch (symbol) {
            case "ETH":
                return 1;
            case "USDT":
                return 5;
            case "USDC":
                return 9;
        }
    }
}

window.customElements.define("webauthn-transaction", e);
export {e as WebAuthnTransaction};