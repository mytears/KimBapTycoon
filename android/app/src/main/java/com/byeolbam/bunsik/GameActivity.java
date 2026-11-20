package com.byeolbam.bunsik;

import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

public class GameActivity extends Activity {
    private WebView game;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        FrameLayout frame = new FrameLayout(this);
        frame.setBackgroundColor(Color.rgb(33, 31, 48));
        frame.setFitsSystemWindows(true);
        game = new WebView(this);
        game.setBackgroundColor(Color.rgb(33, 31, 48));
        game.getSettings().setJavaScriptEnabled(true);
        game.getSettings().setDomStorageEnabled(true);
        game.getSettings().setAllowContentAccess(false);
        game.getSettings().setAllowFileAccess(false);
        game.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return true;
            }
        });
        frame.addView(game);
        setContentView(frame);
        game.loadUrl("file:///android_asset/index.html");
    }

    @Override
    protected void onPause() {
        game.onPause();
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        game.onResume();
    }

    @Override
    public void onBackPressed() {
        game.evaluateJavascript(
            "(function(){var d=document.querySelector('dialog[open]');" +
            "if(d){d.close();return true;}var b=document.querySelector('button[data-page=play]');" +
            "if(b&&!b.hasAttribute('aria-current')){b.click();return true;}return false;})()",
            handled -> { if (!"true".equals(handled)) finish(); });
    }
}
