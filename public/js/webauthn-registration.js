import {SERVER} from "./const/fido-api-constants-es6.js";
const t = {};
// const SERVER1 = "http://localhost:58080"
class e extends HTMLElement {
    constructor() {
        super(), this.root = this.attachShadow({mode: "open"}), this._onFormSubmitListener = this._onFormSubmit.bind(this), this.registrationStartUrl = SERVER + "/api/diyRegister/start", this.registrationFinishUrl = SERVER + "/api/diyRegister/finish", this.fetchOptions = {
            method: "POST",
            credentials: "include",
            headers: {"Content-Type": "application/json"}
        };
    }

    static get observedAttributes() {
        return ["no-username", "label", "input-type", "input-name", "button-text"]
    }

    connectedCallback() {
        this.update(), this.root.querySelector("form").addEventListener("submit", this._onFormSubmitListener)
    }

    disconnectedCallback() {
        this.root.querySelector("form").removeEventListener("submit", this._onFormSubmitListener)
    }

    attributeChangedCallback(t, e, i) {
        if (!this.root.innerHTML) return;
        if (i === e) return;
        const r = this.root.querySelector("label"), n = this.root.querySelector("input"),
            s = this.root.querySelector("button");
        switch (t) {
            case"no-username":
                this._shouldUseUsername();
                break;
            case"label":
                r.textContent = i || this.label;
                break;
            case"button-text":
                s.textContent = i || this.buttonText;
                break;
            case"input-type":
                n.type = i || this.inputType;
                break;
            case"input-name":
                n.name = i || this.inputName
        }
    }

    update() {
        this.root.innerHTML || (this.root.innerHTML =
        `
        <style>
        form#register-form {
            position: relative;
            top: 30px;
        }
        input#el-id-6606-8 {
            border: 1px solid #4d29a7;
            height: 60;
            padding: 1 16;
            background-color: rgb(249, 249, 249);
            width: 90%;
            border-radius: 12px;
            font-size: 18;
        } 
        button#submit-btn {
            position: relative;
            top: 20;
            background-color: #522dd1;
            height: 50;
            width: 90%;
            border-radius: 12px;
            border: none;
            font-family: Arial, sans-serif;
            font-size: 16px;
            font-weight: bold;
            color: #fff;
            cursor: pointer;
        }
        
        button#submit-btn:hover {
            background-color: #7151e0;
        }
        
        </style>
        <form part="form" class="el-form el-form--default el-form--label-right" id="register-form">
\t\t\t\t\t\t\t<div class="el-form-item asterisk-left up-form-item" type="email">
\t\t\t\t\t\t\t\t<!--v-if-->
\t\t\t\t\t\t\t\t<div class="el-form-item__content">
\t\t\t\t\t\t\t\t\t<div class="el-input el-input--prefix el-input--suffix up-input">
\t\t\t\t\t\t\t\t\t\t<!-- input -->
\t\t\t\t\t\t\t\t\t\t<!-- prepend slot -->
\t\t\t\t\t\t\t\t\t\t<!--v-if-->
\t\t\t\t\t\t\t\t\t\t<div class="el-input__wrapper">
\t\t\t\t\t\t\t\t\t\t\t<!-- prefix slot -->
\t\t\t\t\t\t\t\t\t\t\t<span class="el-input__prefix">
\t\t\t\t\t\t\t\t\t\t\t\t<span class="el-input__prefix-inner">
\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="left"></div>
\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="center"></div>
\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="right"></div>
\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="bottom"></div>
\t\t\t\t\t\t\t\t\t\t\t\t\t<!--v-if-->
\t\t\t\t\t\t\t\t\t\t\t\t</span>
\t\t\t\t\t\t\t\t\t\t\t</span>
\t\t\t\t\t\t\t\t\t\t\t<input class="el-input__inner" autofocus="" type="text" autocomplete="off" tabindex="0" placeholder="username" id="el-id-6606-8" name = "username"><!-- suffix slot -->
\t\t\t\t\t\t\t\t\t\t\t<!--v-if-->
\t\t\t\t\t\t\t\t\t\t</div><!-- append slot -->
\t\t\t\t\t\t\t\t\t\t<!--v-if-->
\t\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t\t\t<!--v-if-->
\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t<button class="el-button el-button--primary submit up-button submit" aria-disabled="false" type="submit" id="submit-btn">
\t\t\t\t\t\t\t\t<!--v-if-->
\t\t\t\t\t\t\t\t<span class="">继续</span>
\t\t\t\t\t\t\t</button>
\t\t\t\t\t\t</form>
        `
        ), this._shouldUseUsername()
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
        return this.getAttribute("button-text") || "Register"
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
        const t = this.root.querySelector("input");
        this.noUsername ? (t.required = !1, t.hidden = !0, t.value = "") : (t.required = !0, t.hidden = !1)
    }

    async _getPublicKeyCredentialCreateOptionsDecoder() {
        if ("function" == typeof this.publicKeyCredentialCreateOptionsDecoder) return this.publicKeyCredentialCreateOptionsDecoder;
        if ("function" == typeof t.publicKeyCredentialCreateOptionsDecoder) return t.publicKeyCredentialCreateOptionsDecoder;
        const {decodePublicKeyCredentialCreateOptions: e} = await import("./utils/parse.js");
        return t.publicKeyCredentialCreateOptionsDecoder = e, t.publicKeyCredentialCreateOptionsDecoder
    }

    async _getRegisterCredentialEncoder() {
        if ("function" == typeof this.registerCredentialEncoder) return this.registerCredentialEncoder;
        if ("function" == typeof t.registerCredentialEncoder) return t.registerCredentialEncoder;
        const {encodeRegisterCredential: e} = await import("./utils/parse.js");
        return t.registerCredentialEncoder = e, t.registerCredentialEncoder
    }

    async _onFormSubmit(t) {
        try {
            if (t.preventDefault(), !window.PublicKeyCredential) {
                alert("Fido is not supported on this browser");
                throw new Error("Web Authentication is not supported on this platform");
            }
            this.dispatchEvent(new CustomEvent("registration-started"));
            const e = new FormData(t.target).get(this.inputName), i = await fetch(this.registrationStartUrl, {
                ...this.fetchOptions,
                body: JSON.stringify({username: e})
            }), {status: r, registrationId: n, publicKeyCredentialCreationOptions: s, message: m1} = await i.json();

            if (!i.ok) {
                alert(m1);
                throw new Error(m1 || "Could not successfuly start registration");
            }
            // add by mark   need to delete---------------------------
            s.user.id = "DEMO//9fX19ERU1P";
            // add by mark   need to delete---------------------------
            const o = await this._getPublicKeyCredentialCreateOptionsDecoder(),
                a = await navigator.credentials.create({publicKey: o(s)});
            this.dispatchEvent(new CustomEvent("registration-created"));
            const u = await this._getRegisterCredentialEncoder(), l = await fetch(this.registrationFinishUrl, {
                ...this.fetchOptions,
                body: JSON.stringify({registrationId: n, credential: u(a), userAgent: window.navigator.userAgent})
            }), c = await l.json();
            if (!l.ok) {
                alert(c.message);
                throw new Error(c.message || "Could not successfuly complete registration");
            }
            this.dispatchEvent(new CustomEvent("registration-finished", {detail: c}))
        } catch (t) {
            console.error(t.message);
            this.dispatchEvent(new CustomEvent("registration-error", {detail: {message: t.message}}));
        }
    }
}

window.customElements.define("webauthn-registration", e);
export {e as WebAuthnRegistration};
