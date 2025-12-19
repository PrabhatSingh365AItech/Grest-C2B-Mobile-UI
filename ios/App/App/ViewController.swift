import UIKit
import WebKit
import Capacitor

class ViewController: CAPBridgeViewController {
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Set custom navigation delegate for WebView
        if let webView = self.bridge?.webView {
            webView.navigationDelegate = self
        }
    }
}

extension ViewController: WKNavigationDelegate {
    
    // Handle navigation actions (before request is made)
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        
        guard let url = navigationAction.request.url else {
            decisionHandler(.allow)
            return
        }
        
        let urlString = url.absoluteString
        
        // Open Digilocker URLs in external Safari browser
        if urlString.contains("digio.in") || urlString.contains("digitallocker.gov.in") {
            UIApplication.shared.open(url, options: [:], completionHandler: nil)
            decisionHandler(.cancel)
            return
        }
        
        // Handle custom scheme (deep links back to app)
        if urlString.starts(with: "grestc2b://") {
            // Let Capacitor handle this
            decisionHandler(.allow)
            return
        }
        
        // Allow all other requests
        decisionHandler(.allow)
    }
}

