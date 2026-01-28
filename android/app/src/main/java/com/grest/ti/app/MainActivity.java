package com.grest.ti.app;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import androidx.core.content.FileProvider;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class MainActivity extends BridgeActivity {

    private ValueCallback<Uri[]> filePathCallback;
    private static final int FILE_CHOOSER_REQUEST_CODE = 1;
    private Uri cameraImageUri;

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

        // Add WebChromeClient to handle file chooser for HTML file inputs
        this.bridge.getWebView().setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback,
                                            FileChooserParams fileChooserParams) {
                // Cancel any previous file chooser
                if (MainActivity.this.filePathCallback != null) {
                    MainActivity.this.filePathCallback.onReceiveValue(null);
                }
                MainActivity.this.filePathCallback = filePathCallback;

                try {
                    // Create camera intent
                    Intent takePictureIntent = new Intent(android.provider.MediaStore.ACTION_IMAGE_CAPTURE);

                    // Create a file to store the camera image
                    File photoFile = createImageFile();
                    if (photoFile != null) {
                        cameraImageUri = FileProvider.getUriForFile(
                            MainActivity.this,
                            getApplicationContext().getPackageName() + ".fileprovider",
                            photoFile
                        );
                        takePictureIntent.putExtra(android.provider.MediaStore.EXTRA_OUTPUT, cameraImageUri);
                    }

                    // Create gallery/file picker intent
                    Intent pickIntent = new Intent(Intent.ACTION_GET_CONTENT);
                    pickIntent.setType("image/*");
                    pickIntent.addCategory(Intent.CATEGORY_OPENABLE);

                    // Create chooser intent with both options
                    Intent chooserIntent = Intent.createChooser(pickIntent, "Select Image");
                    chooserIntent.putExtra(Intent.EXTRA_INITIAL_INTENTS, new Intent[]{takePictureIntent});

                    startActivityForResult(chooserIntent, FILE_CHOOSER_REQUEST_CODE);
                } catch (Exception e) {
                    MainActivity.this.filePathCallback = null;
                    return false;
                }
                return true;
            }
        });
    }

    private File createImageFile() throws IOException {
        String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(new Date());
        String imageFileName = "JPEG_" + timeStamp + "_";
        File storageDir = getExternalFilesDir(Environment.DIRECTORY_PICTURES);
        return File.createTempFile(imageFileName, ".jpg", storageDir);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == FILE_CHOOSER_REQUEST_CODE) {
            if (filePathCallback == null) {
                super.onActivityResult(requestCode, resultCode, data);
                return;
            }

            Uri[] results = null;

            if (resultCode == RESULT_OK) {
                if (data == null || data.getData() == null) {
                    // Photo was taken with camera
                    if (cameraImageUri != null) {
                        results = new Uri[]{cameraImageUri};
                    }
                } else {
                    // File was selected from gallery
                    String dataString = data.getDataString();
                    if (dataString != null) {
                        results = new Uri[]{Uri.parse(dataString)};
                    }
                }
            }

            filePathCallback.onReceiveValue(results);
            filePathCallback = null;
            cameraImageUri = null;
        } else {
            super.onActivityResult(requestCode, resultCode, data);
        }
    }
}