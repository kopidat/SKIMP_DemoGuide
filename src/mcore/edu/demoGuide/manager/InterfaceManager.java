package mcore.edu.demoGuide.manager;

import android.app.Activity;
import android.content.Intent;

import org.json.JSONObject;

import m.client.android.library.core.managers.ActivityHistoryManager;
import m.client.android.library.core.utils.PLog;
import m.client.android.library.core.view.AbstractActivity;
import m.client.android.library.core.view.MainActivity;
import mcore.edu.demoGuide.common.Const;

public class InterfaceManager {
    private final String LOG_TAG = Const.GLOBAL_LOG_TAG;

    private static InterfaceManager mJavaScriptCallBackManager;

    public static InterfaceManager getInstance() {
        if (mJavaScriptCallBackManager == null) {
            mJavaScriptCallBackManager = new InterfaceManager();
        }
        return mJavaScriptCallBackManager;
    }

    public void loadUrl(final Activity activity, final String method, final String data1) {
        final Activity topAct = (AbstractActivity) ActivityHistoryManager.getInstance().getTopActivity();
        activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                String script = String.format("javascript:" + method + "('%s')", data1);
                PLog.i(LOG_TAG, "client InterfaceManager loadUrl = " + script);
                ((MainActivity) topAct).getWebView().loadUrl(script);
            }
        });
    }

    public void loadUrl(final Activity activity, final String method, final String data1, final String data2) {
        final Activity topAct = (AbstractActivity) ActivityHistoryManager.getInstance().getTopActivity();
        activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                String script = String.format("javascript:" + method + "('%s','%s')", data1, data2);
                ((MainActivity) topAct).getWebView().loadUrl(script);
            }
        });
    }

    public void loadUrl(final Activity activity, final String method, final String data1, final JSONObject data2) {
        final Activity topAct = (AbstractActivity) ActivityHistoryManager.getInstance().getTopActivity();
        activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                String script = String.format("javascript:" + method + "('%s',", data1);
                ((MainActivity) topAct).getWebView().loadUrl(script + data2+")");
            }
        });
    }

    public void loadUrl(final Activity activity, final String method, final String data1, final String data2, final String data3) {
        final Activity topAct = (AbstractActivity) ActivityHistoryManager.getInstance().getTopActivity();
        activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                String script = String.format("javascript:" + method + "('%s','%s','%s')", data1, data2, data3);
                ((MainActivity) topAct).getWebView().loadUrl(script);
            }
        });
    }

    // 간편인증 핀 결과값 전달
    public void sendPinResult(final Activity activity, int resultCode, final String result, final String pin, final String message){
        Intent intent = new Intent();
        intent.putExtra("KEY_RESULT", result);
        intent.putExtra("pin", pin);
        intent.putExtra("message", message);
        activity.setResult(resultCode, intent);
        activity.finish();
    }
    // 간편인증 패턴 결과값 전달
    public void sendPatternResult(final Activity activity, int resultCode, final String result, final String code, final String message){
        Intent intent = new Intent();
        intent.putExtra("KEY_RESULT", result);
        intent.putExtra("KEY_CODE", code);
        intent.putExtra("message", message);
        activity.setResult(resultCode, intent);
        activity.finish();
    }

}
