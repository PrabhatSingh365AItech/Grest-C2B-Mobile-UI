package com.grest.ti.app;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;

public class MainActivity extends BridgeActivity {
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onStart() {
        super.onStart();
        
        // Add custom WebViewClient to handle external URLs
        this.bridge.setWebViewClient(new BridgeWebViewClient(this.bridge) {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                
                // Open Digilocker URLs in external browser
                if (url != null && (url.contains("digio.in") || url.contains("digitallocker.gov.in"))) {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    startActivity(intent);
                    return true;
                }
                
                // Handle custom scheme (deep links back to app)
                if (url != null && url.startsWith("grestc2b://")) {
                    return super.shouldOverrideUrlLoading(view, request);
                }
                
                return super.shouldOverrideUrlLoading(view, request);
            }
        });
    }
}