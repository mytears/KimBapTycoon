package com.byeolbam.bunsik;

import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

import androidx.annotation.NonNull;

import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.FullScreenContentCallback;
import com.google.android.gms.ads.AdError;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.rewarded.RewardedAd;
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback;

public class GameActivity extends Activity {
    private WebView game;
    private boolean adRequestInFlight;

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
        game.addJavascriptInterface(new Object() {
            @JavascriptInterface
            public void showRewardedAd(int ticket) {
                runOnUiThread(() -> GameActivity.this.showRewardedAd(ticket));
            }
        }, "AndroidAds");
        game.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return true;
            }
        });
        frame.addView(game);
        setContentView(frame);
        game.loadUrl("file:///android_asset/index.html");
        new Thread(() -> MobileAds.initialize(this, status -> {})).start();
    }

    private void reportAdResult(int ticket, boolean rewarded, String reason) {
        game.evaluateJavascript("window.onRewardedAdResult(" + ticket + "," + rewarded + ",'" + reason + "')", null);
    }

    private void showRewardedAd(int ticket) {
        if (adRequestInFlight) {
            reportAdResult(ticket, false, "unavailable");
            return;
        }
        adRequestInFlight = true;
        RewardedAd.load(this, getString(R.string.rewarded_ad_unit_id), new AdRequest.Builder().build(),
            new RewardedAdLoadCallback() {
                @Override
                public void onAdLoaded(@NonNull RewardedAd ad) {
                    final boolean[] earned = { false };
                    ad.setFullScreenContentCallback(new FullScreenContentCallback() {
                        @Override
                        public void onAdDismissedFullScreenContent() {
                            adRequestInFlight = false;
                            reportAdResult(ticket, earned[0], earned[0] ? "rewarded" : "dismissed");
                        }

                        @Override
                        public void onAdFailedToShowFullScreenContent(@NonNull AdError error) {
                            adRequestInFlight = false;
                            reportAdResult(ticket, false, "unavailable");
                        }
                    });
                    ad.show(GameActivity.this, reward -> earned[0] = true);
                }

                @Override
                public void onAdFailedToLoad(@NonNull LoadAdError error) {
                    adRequestInFlight = false;
                    reportAdResult(ticket, false, "unavailable");
                }
            });
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
            "if(d){var e=new Event('cancel',{cancelable:true});if(d.dispatchEvent(e))d.close();return true;}var b=document.querySelector('button[data-page=play]');" +
            "if(b&&!b.hasAttribute('aria-current')){b.click();return true;}return false;})()",
            handled -> { if (!"true".equals(handled)) finish(); });
    }
}
