/* 
 * Pop under script v 1.0
 */

(function () {
    console.log(window.opener);
    // the interval for checking page loaded, we do not need very fast
    var checkLoadInterval = 1000;
    var onloadHook = "onPopUnderLoaded";
    var popNumField = "popnum";

    var handler = {
        num: -1, // no limit
        hours: 24,
        tabUnder: false,
        onPopCallback: null,
        winWidth: window.screen.availWidth - 122,
        winHeight: window.screen.availHeight - 122,
        isIE: (navigator.userAgent.indexOf("MSIE") !== -1),
        isChrome: (navigator.userAgent.indexOf("Chrome/") !== -1) && (navigator.userAgent.indexOf("AppleWebKit") !== -1),
        hasPop: false,
        frequency: function (num, hours) {
            if (hours === undefined) {
                hours = 24;
            }
            this.num = num;
            this.hours = hours;
            return this;
        },
        useTabUnder: function(allow) {
            this.tabUnder = allow;
            return this;
        },
        pop: function (url) {
            // give chance for other setting works
            setTimeout(function () {
                var popnum = this.getPopNum();
                if (this.num < 0 || popnum < this.num) {
                    this.startPop(url);
                }
            }.bind(this), 1);

            return this;
        },
        startPop: function (url) {
            if (this.isIE) {
                this.tryPopIENow(url);
            } else if (!this.isChrome) {
                this.tryPop(url);
            }
            this.onClick(function () {
                this.popOnClick(url);
            }.bind(this));
        },
        onPop: function (callback) {
            this.onPopCallback = callback;
            return this;
        },
        tryPopIENow: function (url) {
            var hackElementId = "pop_under_hack";
            var popie = document.createElement("object");
            popie.id = hackElementId;
            popie.setAttribute("classid", "clsid:2D360201-FFF5-11d1-8D03-00A0C959BC0A");
            popie.style.cssText = "width:1px;height:1px;top:0;left:0;position:absolute;";
            document.body.appendChild(popie);

            setTimeout(function () {
                if (this.hasPop) {
                    return;
                }
                var clkpopwin = document.getElementById(hackElementId).DOM.Script.open(
                        url,
                        "_blank",
                        "top=0,left=0, width=" + this.winWidth + ",height=" + this.winHeight);
                if (clkpopwin) {
                    window.self.focus();
                    clkpopwin.blur();
                    this.popDone();
                }
            }.bind(this), 1500);
        },
        tryPop: function (url) {
            var date = new Date(), winName = "Ads" + date.getTime(), popwinCLK;
            popwinCLK = this.openWin(url, winName);
            if (popwinCLK) {
                popwinCLK.blur();
                if (this.isChrome) {
                    window.blur();
                }
                window.focus();
                this.popDone();
            }
        },
        popOnClick: function(url) {
            if (this.hasPop) {
                return;
            }
            if ( this.tabUnder ) {
                this.doTabUnder(url);
            } else {
                this.tryPop(url);
            }
        },
        doTabUnder: function(url) {
            window.open(window.location.href, "_blank");
            window.location = url;
        },
        openWin: function (url, name) {
            var params = "toolbar=0,scrollbars=1,statusbar=1,resizable=1,menubar=0,location=1,top=0,left=0,width=" + this.winWidth + ",height=" + this.winHeight;

            if (window.SymRealWinOpen) {
                return window.SymRealWinOpen(url, name, params);
            } else if (window.NS_ActualOpen) {
                return window.NS_ActualOpen(url, name, params);
            } else {
                return window.open(url, name, params);
            }
        },
        popDone: function () {
            this.hasPop = true;
            this.updatePopNum();
            if (this.onPopCallback) {
                this.onPopCallback.call(this);
            }
        },
        getPopNum: function () {
            var popnum = this.getData(popNumField);
            if (!popnum) {
                popnum = 0;
            } else {
                if ((typeof popnum) === "string") {
                    popnum = parseInt(popnum);
                }
            }
            return popnum;
        },
        updatePopNum: function () {
            if (this.num > 0) {
                var popnum = this.getPopNum() + 1;
                var expires = null;
                if (this.hours > 0) {
                    expires = new Date();
                    expires.setTime(expires.getTime() + this.hours * 3600 * 1000);
                }
                this.setData(popNumField, popnum, expires);
            }
        },
        onClick: function (callback) {
            if (document.captureEvents) {
                document.captureEvents(window.Event.CLICK);
            }
            if (document.addEventListener) {
                document.addEventListener("click", callback, false);
            } else if (document.attachEvent) {
                document.attachEvent("click", callback);
            } else {
                document.onclick = callback;
            }
        },
        setData: function (name, value, expires) {
            if (window.Storage) {
                this.setStorage(name, value, expires);
            } else {
                this.setCookie(name, value, expires);
            }
        },
        getData: function (name) {
            if (window.Storage) {
                return this.getStorage(name);
            } else {
                return this.getCookie(name);
            }
        },
        setCookie: function (name, value, expires) {
            document.cookie = name + "=" + encodeURI(value) +
                    (expires ? "; expires=" + expires.toGMTString() : "");
        },
        getCookie: function (name) {
            var arg = name + "=", alen = arg.length, clen = document.cookie.length,
                    i = 0, j;
            while (i < clen) {
                j = i + alen;
                if (document.cookie.substring(i, j) === arg) {
                    return this.getCookieVal(j);
                }
                i = document.cookie.indexOf(" ", i) + 1;
                if (i === 0) {
                    break;
                }
            }
            return null;
        },
        getCookieVal: function (offset) {
            var str = document.cookie.indexOf(";", offset);
            if (str === -1) {
                str = document.cookie.length;
            }
            return decodeURI(document.cookie.substring(offset, str));
        },
        setStorage: function (name, value, expires) {
            if (expires) {
                window.localStorage.setItem(name, JSON.stringify({
                    value: value,
                    expire: expires.getTime()
                }));
            } else {
                window.sessionStorage.setItem(name, JSON.stringify({
                    value: value,
                    expire: 0
                }));
            }
        },
        getStorage: function (name) {
            var obj = window.sessionStorage.getItem(name);
            if (!obj) {
                obj = window.localStorage.getItem(name);
            }
            if (!obj) {
                return null;
            }
            obj = JSON.parse(obj);
            if (obj.expire && (obj.expire < (new Date()).getTime())) {
                // value expired
                return null;
            }
            return obj.value;
        }
    };

    // wait for document ready
    var allLoaded = setInterval(function () {
        if (/loaded|complete/.test(document.readyState)) {
            clearInterval(allLoaded);
            if (window[onloadHook]) {
                window[onloadHook].call(handler);
            } else {
                console.log("pop under onload hook not defined");
            }
        }
    }, checkLoadInterval);
})();
