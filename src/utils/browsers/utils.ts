import { runAppleScript } from "@raycast/utils";
import fetch from "node-fetch";

/**
 * Gets the raw HTML of a URL.
 *
 * @param URL The URL to get the HTML of.
 * @returns The HTML as a string.
 */
export const getURLHTML = async (URL: string): Promise<string> => {
  const request = await fetch(URL);
  return await request.text();
};

/**
 * Gets the visible text of a URL.
 *
 * @param URL The URL to get the visible text of.
 * @returns A promise resolving to the visible text as a string.
 */
export const getTextOfWebpage = async (URL: string): Promise<string> => {
  const html = await getURLHTML(URL);
  const filteredString = html
    .replaceAll(/(<br ?\/?>|[\n\r]+)/g, "\n")
    .replaceAll(
      /(<script[\s\S\n\r]+?<\/script>|<style[\s\S\n\r]+?<\/style>|<nav[\s\S\n\r]+?<\/nav>|<link[\s\S\n\r]+?<\/link>|<form[\s\S\n\r]+?<\/form>|<button[\s\S\n\r]+?<\/button>|<!--[\s\S\n\r]+?-->|<select[\s\S\n\r]+?<\/select>|<[\s\n\r\S]+?>)/g,
      "\t",
    )
    .replaceAll(/(\t+)/g, "\n")
    .replaceAll(/([\t ]*[\n\r][\t ]*)+/g, "\r")
    .replaceAll(/(\([^A-Za-z0-9\n]*\)|(?<=[,.!?%*])[,.!?%*]*?\s*[,.!?%*])/g, " ")
    .replaceAll(/{{(.*?)}}/g, "$1");
  return filteredString.trim();
};

export const runJSAgainstHTML = async (script: string, html?: string, url?: string) => {
  return await runAppleScript(
    `(() => {
    ObjC.import("AppKit");
    ObjC.import("WebKit");
    ObjC.import("objc");
    
    let baseURL = null;
    ${url ? `baseURL = "${url}";` : ""}

    let rawHTML = null;
    ${html ? `rawHTML = "${html.replaceAll(/"/g, '\\"').replaceAll(/[\n\r]+/g, " ")}";` : ""}
  
    // Size of WebView
    const width = 1080;
    const height = 720;
  
    const WKNavigationDelegate = $.objc_getProtocol("WKNavigationDelegate");
    const _NSApp = $.NSApplication.sharedApplication;
  
    if (!$["WebViewDelegate"]) {
      ObjC.registerSubclass({
        name: "WebViewDelegate",
        superclass: "NSObject",
        protocols: ["WKNavigationDelegate"],
        properties: {
          result: "id",
        },
        methods: {
          "webView:didFinishNavigation:": {
            types: ["void", ["id", "id"]],
            implementation: function (webview, navigation) {
              // Run JS to get the HTML of the document
              let jsString = "${script.replaceAll(/"/g, '\\"').replaceAll(/[\n\r]+/g, ";")}";
              webview.evaluateJavaScriptCompletionHandler(
                jsString,
                (result, error) => {
                  if (error.localizedDescription) {
                    $.NSLog(error.localizedDescription);
                    this.result = $.NSString.stringWithString("Error");
                    return;
                  }
                  this.result = result;
                }
              );
            },
          },
        },
      });
    }
  
    const frame = $.NSMakeRect(0, 0, width, height / 2);
    const config = $.WKWebViewConfiguration.alloc.init;
    const view = $.WKWebView.alloc.initWithFrameConfiguration(frame, config);
    const delegate = $.WebViewDelegate.alloc.init;
    view.navigationDelegate = delegate;
  
    ${
      html
        ? `const nav = view.loadHTMLStringBaseURL(rawHTML, $.NSURL.alloc.initWithString(""));`
        : `
        // Create request and set HTTP header(s)
        const request = $.NSMutableURLRequest.requestWithURL($.NSURL.URLWithString(baseURL));
        request.setValueForHTTPHeaderField(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Safari/605.1.15",
        "User-Agent");
        const nav = view.loadRequest(request);`
    }
  
    // Wait for HTML source
    while (delegate.result.js == undefined) {
      runLoop = $.NSRunLoop.currentRunLoop;
      today = $.NSDate.dateWithTimeIntervalSinceNow(0.1);
      runLoop.runUntilDate(today);
    }
  
    return delegate.result.js;
  })();`,
    { language: "JavaScript" },
  );
};
