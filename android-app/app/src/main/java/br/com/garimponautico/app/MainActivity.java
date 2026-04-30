package br.com.garimponautico.app;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.ConnectivityManager;
import android.net.NetworkCapabilities;
import android.net.Uri;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

public class MainActivity extends Activity {
    private static final String HOME_URL = "https://garimponautico.tech/";
    private static final String WHATSAPP_URL = "https://wa.me/5524992527966";
    private static final String DOMAIN = "garimponautico.tech";

    private WebView webView;
    private ProgressBar progressBar;
    private LinearLayout errorPanel;
    private Button backButton;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        buildLayout();
        configureWebView();
        loadStartUrl();
    }

    private void buildLayout() {
        int seaDeep = Color.rgb(18, 68, 82);
        int paper = Color.rgb(251, 250, 246);
        int signal = Color.rgb(242, 184, 75);
        int ink = Color.rgb(24, 32, 38);

        LinearLayout root = new LinearLayout(this);
        root.setBackgroundColor(paper);
        root.setOrientation(LinearLayout.VERTICAL);

        LinearLayout toolbar = new LinearLayout(this);
        toolbar.setGravity(Gravity.CENTER_VERTICAL);
        toolbar.setOrientation(LinearLayout.HORIZONTAL);
        toolbar.setPadding(dp(12), dp(8), dp(12), dp(8));
        toolbar.setBackgroundColor(seaDeep);

        backButton = toolbarButton("Voltar", false);
        Button reloadButton = toolbarButton("Atualizar", false);
        Button whatsappButton = toolbarButton("WhatsApp", true);
        TextView title = new TextView(this);
        title.setText("Garimpo Nautico");
        title.setTextColor(Color.WHITE);
        title.setTextSize(17);
        title.setGravity(Gravity.CENTER_VERTICAL);
        title.setTypeface(null, android.graphics.Typeface.BOLD);

        toolbar.addView(backButton, new LinearLayout.LayoutParams(dp(72), dp(44)));
        toolbar.addView(title, new LinearLayout.LayoutParams(0, dp(44), 1));
        toolbar.addView(reloadButton, new LinearLayout.LayoutParams(dp(90), dp(44)));
        toolbar.addView(whatsappButton, new LinearLayout.LayoutParams(dp(94), dp(44)));

        progressBar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        progressBar.setMax(100);
        progressBar.setProgress(0);
        progressBar.setVisibility(View.GONE);

        FrameLayout content = new FrameLayout(this);
        webView = new WebView(this);
        errorPanel = createErrorPanel(ink, seaDeep, signal);

        content.addView(webView, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        ));
        content.addView(errorPanel, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        ));
        errorPanel.setVisibility(View.GONE);

        backButton.setOnClickListener(view -> goBack());
        reloadButton.setOnClickListener(view -> reload());
        whatsappButton.setOnClickListener(view -> openExternal(WHATSAPP_URL));

        root.addView(toolbar, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
        ));
        root.addView(progressBar, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                dp(3)
        ));
        root.addView(content, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                0,
                1
        ));

        setContentView(root);
    }

    private Button toolbarButton(String label, boolean highlighted) {
        Button button = new Button(this);
        button.setAllCaps(false);
        button.setText(label);
        button.setTextSize(13);
        button.setTextColor(highlighted ? Color.rgb(24, 32, 38) : Color.WHITE);
        button.setBackgroundColor(highlighted ? Color.rgb(242, 184, 75) : Color.TRANSPARENT);
        button.setMinHeight(0);
        button.setMinWidth(0);
        button.setPadding(dp(4), 0, dp(4), 0);
        return button;
    }

    private LinearLayout createErrorPanel(int ink, int seaDeep, int signal) {
        LinearLayout panel = new LinearLayout(this);
        panel.setGravity(Gravity.CENTER);
        panel.setOrientation(LinearLayout.VERTICAL);
        panel.setPadding(dp(28), dp(28), dp(28), dp(28));
        panel.setBackgroundColor(Color.rgb(251, 250, 246));

        TextView heading = new TextView(this);
        heading.setText("Nao foi possivel carregar o Garimpo Nautico");
        heading.setTextColor(ink);
        heading.setGravity(Gravity.CENTER);
        heading.setTextSize(22);
        heading.setTypeface(null, android.graphics.Typeface.BOLD);

        TextView message = new TextView(this);
        message.setText("Confira sua internet e toque em tentar novamente. O app fica sincronizado com o site oficial.");
        message.setTextColor(Color.rgb(89, 100, 108));
        message.setGravity(Gravity.CENTER);
        message.setTextSize(16);
        message.setPadding(0, dp(12), 0, dp(20));

        Button retry = new Button(this);
        retry.setAllCaps(false);
        retry.setText("Tentar novamente");
        retry.setTextColor(ink);
        retry.setTextSize(16);
        retry.setBackgroundColor(signal);
        retry.setOnClickListener(view -> loadStartUrl());

        Button contact = new Button(this);
        contact.setAllCaps(false);
        contact.setText("Falar no WhatsApp");
        contact.setTextColor(seaDeep);
        contact.setTextSize(15);
        contact.setBackgroundColor(Color.TRANSPARENT);
        contact.setOnClickListener(view -> openExternal(WHATSAPP_URL));

        panel.addView(heading, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
        ));
        panel.addView(message, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
        ));
        panel.addView(retry, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                dp(52)
        ));
        panel.addView(contact, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                dp(52)
        ));

        return panel;
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void configureWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setUserAgentString(settings.getUserAgentString() + " GarimpoNauticoApp/1.0");

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                progressBar.setProgress(newProgress);
                progressBar.setVisibility(newProgress >= 100 ? View.GONE : View.VISIBLE);
            }
        });

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String scheme = uri.getScheme() == null ? "" : uri.getScheme();
                String host = uri.getHost() == null ? "" : uri.getHost();

                if (host.equals(DOMAIN) || host.equals("www." + DOMAIN)) {
                    return false;
                }

                if (scheme.equals("tel") || scheme.equals("mailto") || host.contains("wa.me") || host.contains("whatsapp")) {
                    openExternal(uri.toString());
                    return true;
                }

                openExternal(uri.toString());
                return true;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                errorPanel.setVisibility(View.GONE);
                webView.setVisibility(View.VISIBLE);
                backButton.setEnabled(webView.canGoBack());
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) {
                    showError();
                }
            }
        });
    }

    private void loadStartUrl() {
        if (!hasNetwork()) {
            showError();
            return;
        }

        errorPanel.setVisibility(View.GONE);
        webView.setVisibility(View.VISIBLE);
        webView.loadUrl(HOME_URL);
    }

    private void reload() {
        if (webView.getUrl() == null) {
            loadStartUrl();
            return;
        }

        webView.reload();
    }

    private void goBack() {
        if (webView.canGoBack()) {
            webView.goBack();
            return;
        }

        moveTaskToBack(true);
    }

    private void showError() {
        webView.setVisibility(View.GONE);
        errorPanel.setVisibility(View.VISIBLE);
        progressBar.setVisibility(View.GONE);
    }

    private boolean hasNetwork() {
        ConnectivityManager connectivityManager = (ConnectivityManager) getSystemService(CONNECTIVITY_SERVICE);
        if (connectivityManager == null || connectivityManager.getActiveNetwork() == null) {
            return false;
        }

        NetworkCapabilities capabilities = connectivityManager.getNetworkCapabilities(connectivityManager.getActiveNetwork());
        return capabilities != null && capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET);
    }

    private void openExternal(String url) {
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
        } catch (ActivityNotFoundException error) {
            Toast.makeText(this, "Nao foi possivel abrir este link.", Toast.LENGTH_SHORT).show();
        }
    }

    @Override
    public void onBackPressed() {
        goBack();
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }
}
