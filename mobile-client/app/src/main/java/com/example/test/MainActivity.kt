package com.example.test

import android.app.AppOpsManager
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.os.Process
import android.provider.Settings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CloudUpload
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.example.test.api.UpsertUsageBody
import com.example.test.api.UsageApi
import com.example.test.auth.PocketBaseAuthBridge
import com.example.test.ui.theme.TestTheme
import com.example.test.usage.UsageStatsCollector
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import retrofit2.HttpException

class MainActivity : ComponentActivity() {

    private var webView: WebView? = null

    @OptIn(ExperimentalMaterial3Api::class)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val usageApi = UsageApi.create(BuildConfig.POCKETBASE_URL)

        setContent {
            TestTheme {
                Scaffold(
                    modifier = Modifier.fillMaxSize(),
                    topBar = {
                        TopAppBar(
                            title = { Text("ScreenSplit") },
                            actions = {
                                IconButton(onClick = { publishUsage(usageApi) }) {
                                    Icon(
                                        Icons.Filled.CloudUpload,
                                        contentDescription = "Publish today’s screen time",
                                    )
                                }
                            },
                        )
                    },
                ) { innerPadding ->
                    WebScreen(
                        url = BuildConfig.WEB_APP_URL,
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(innerPadding),
                        onWebViewCreated = { webView = it },
                    )
                }
            }
        }
    }

    private fun publishUsage(usageApi: UsageApi) {
        if (!isUsageStatsPermissionGranted(this)) {
            Toast.makeText(
                this,
                "Allow usage access in Settings to publish screen time",
                Toast.LENGTH_LONG,
            ).show()
            startActivity(Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS))
            return
        }

        val wv = webView
        if (wv == null) {
            Toast.makeText(this, "WebView not ready", Toast.LENGTH_SHORT).show()
            return
        }

        PocketBaseAuthBridge.readTokenAsync(wv) { token ->
            if (token.isNullOrBlank()) {
                Toast.makeText(
                    this,
                    "Sign in in the web app first, then tap upload again",
                    Toast.LENGTH_LONG,
                ).show()
                return@readTokenAsync
            }

            lifecycleScope.launch(Dispatchers.IO) {
                try {
                    val apps = UsageStatsCollector.collectTodayEntries(
                        this@MainActivity,
                        packageName,
                    )
                    if (apps.isEmpty()) {
                        withContext(Dispatchers.Main) {
                            Toast.makeText(
                                this@MainActivity,
                                "No usage data for today yet",
                                Toast.LENGTH_SHORT,
                            ).show()
                        }
                        return@launch
                    }
                    val reportDate = UsageStatsCollector.utcTodayReportDate()
                    usageApi.upsertMyUsage(
                        token.trim(),
                        UpsertUsageBody(
                            reportDate = reportDate,
                            apps = apps,
                            source = "android",
                        ),
                    )
                    withContext(Dispatchers.Main) {
                        Toast.makeText(
                            this@MainActivity,
                            "Published usage for $reportDate",
                            Toast.LENGTH_SHORT,
                        ).show()
                    }
                } catch (e: HttpException) {
                    withContext(Dispatchers.Main) {
                        val err =
                            e.response()?.errorBody()?.string()?.take(120)
                                ?: e.message()
                        Toast.makeText(
                            this@MainActivity,
                            "Sync failed ($err)",
                            Toast.LENGTH_LONG,
                        ).show()
                    }
                } catch (e: Exception) {
                    withContext(Dispatchers.Main) {
                        Toast.makeText(
                            this@MainActivity,
                            "Sync failed: ${e.message}",
                            Toast.LENGTH_LONG,
                        ).show()
                    }
                }
            }
        }
    }
}

@Composable
private fun WebScreen(
    url: String,
    modifier: Modifier = Modifier,
    onWebViewCreated: (WebView) -> Unit,
) {
    AndroidView(
        factory = { ctx ->
            WebView(ctx).apply {
                settings.javaScriptEnabled = true
                settings.domStorageEnabled = true
                webViewClient = WebViewClient()
                loadUrl(url)
                onWebViewCreated(this)
            }
        },
        modifier = modifier,
    )
}

private fun isUsageStatsPermissionGranted(context: Context): Boolean {
    val appOps = ContextCompat.getSystemService(context, AppOpsManager::class.java)
    val mode = appOps?.checkOpNoThrow(
        AppOpsManager.OPSTR_GET_USAGE_STATS,
        Process.myUid(),
        context.packageName,
    )
    return mode == AppOpsManager.MODE_ALLOWED
}
