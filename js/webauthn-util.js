const t = {};

async function _onFormSubmit(e) {
    const registrationStartUrl = "api/diyRegister/start";
    const registrationFinishUrl = "api/diyRegister/finish";
    const fetchOptions = {
        method: "POST",
        credentials: "include",
        headers: {"Content-Type": "application/json"}
    }
    try {
        if (!window.PublicKeyCredential) throw new Error("Web Authentication is not supported on this platform");
        dispatchEvent(new CustomEvent("registration-started"));
        i = await fetch(registrationStartUrl, {
            fetchOptions,
            body: JSON.stringify({username: e})
        }), {status: r, registrationId: n, publicKeyCredentialCreationOptions: s} = await i.json();
        if (!i.ok) throw new Error(r || "Could not successfuly start registration");
        const o = await _getPublicKeyCredentialCreateOptionsDecoder(),
            a = await navigator.credentials.create({publicKey: o(s)});
        dispatchEvent(new CustomEvent("registration-created"));
        const u = await _getRegisterCredentialEncoder(), l = await fetch(registrationFinishUrl, {
            fetchOptions,
            body: JSON.stringify({registrationId: n, credential: u(a), userAgent: window.navigator.userAgent})
        });
        if (!l.ok) throw new Error("Could not successfuly complete registration");
        const c = await l.json();
        dispatchEvent(new CustomEvent("registration-finished", {detail: c}))
    } catch (t) {
        dispatchEvent(new CustomEvent("registration-error", {detail: {message: t.message}}))
    }
}

async function _getPublicKeyCredentialCreateOptionsDecoder() {
    if ("function" == typeof this.publicKeyCredentialCreateOptionsDecoder) return this.publicKeyCredentialCreateOptionsDecoder;
    if ("function" == typeof t.publicKeyCredentialCreateOptionsDecoder) return t.publicKeyCredentialCreateOptionsDecoder;
    const {decodePublicKeyCredentialCreateOptions: e} = await import("./utils/parse.js");
    return t.publicKeyCredentialCreateOptionsDecoder = e, t.publicKeyCredentialCreateOptionsDecoder
}

async function _getRegisterCredentialEncoder() {
    if ("function" == typeof this.registerCredentialEncoder) return this.registerCredentialEncoder;
    if ("function" == typeof t.registerCredentialEncoder) return t.registerCredentialEncoder;
    const {encodeRegisterCredential: e} = await import("./utils/parse.js");
    return t.registerCredentialEncoder = e, t.registerCredentialEncoder
}