function getURLParams() {return Object.fromEntries(new URLSearchParams(window.location.search));}

function setUrlParam(parameter, value, reload = false) {
    const urlsplit = document.location.href.split("?");
    let urlparam = "";
    if (urlsplit[1]) {
        const urlparamparts = urlsplit[1].split("&");
        const urlPartsFiltered = urlparamparts.filter((str) => !str.includes(parameter));
        urlparam = urlPartsFiltered.join("&");
    }
    const URL = urlsplit[0] + "?" + urlparam + "&" + parameter + "=" + value;
    const newState = { page: "new-url" };
    if (!reload) history.replaceState(newState, "", URL); //set Url without reload
    else document.location.href = URL; //set Url and trigger reload
}

function setURLParams(object) { for (const [key, value] of Object.entries(object)) setUrlParam(key, value); }