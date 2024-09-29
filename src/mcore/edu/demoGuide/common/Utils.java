package mcore.edu.demoGuide.common;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Log;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Set;

import m.client.android.library.core.utils.PLog;


public class Utils {
	private static final String TAG = Utils.class.getSimpleName();

	public static void uriQueryToJson(JSONObject destJson, Uri srcUri) {
		Log.i(TAG, "uriQueryToJson(JSONObject destJson, Uri srcUri) = " + srcUri);

		if(srcUri == null) {
			Log.w(TAG, "if(srcUri == null)");
			return;
		}

		Log.d(TAG, "srcUri.getQuery() = " + srcUri.getQuery());
		Log.d(TAG, "srcUri.getQueryParameterNames() = " + srcUri.getQueryParameterNames());
		Set<String> keys = srcUri.getQueryParameterNames();
		Log.d(TAG, "keys.size() = " + keys.size());
		for(String key : keys) {
			String value = srcUri.getQueryParameter(key);
			Log.d(TAG, "key / value = " + key + " / " + value);
			try {
				destJson.put(key, value);
			} catch (JSONException e) {
				// 안드로이드 소스코드 결과보고서.docx, 4.5. 오류메시지를 통한 정보 노출
//				e.printStackTrace();
				PLog.e(TAG, "catch (JSONException e) {");
			}
		}
	}
	
	public static void debugIntent(Intent intent) {
		debugIntent(TAG, intent);
	}

	public static void debugIntent(String tag, Intent intent) {
		if(TextUtils.isEmpty(tag)) {
			tag = TAG;
		}

		Log.i(tag, "debugIntent(Intent intent) = " + intent);

		if(intent == null) {
			Log.w(tag, "if(intent == null)");
			return;
		}

		debugUri(tag, intent.getData());

		Bundle extras = intent.getExtras();
		debugBundle(tag, extras);

//		if(extras == null) {
//			Log.w(tag, "if(extras == null)");
//			return;
//		}
//
//		Set<String> keys = extras.keySet();
//		Log.d(tag, "Bundle extras keys.size() = " + keys.size());
//
//		for(String key : keys) {
//			Log.d(tag, "key / value = " + key + " / " + extras.get(key));
//
//			Bundle extra = extras.getBundle(key);
//			if(extra != null) {
//				Set<String> extraKeys = extra.keySet();
//				Log.d(tag, "extraKeys.size() = " + extraKeys.size());
//
//				for(String extraKey : extraKeys) {
//					Log.d(tag, "extraKey / value = " + extraKey + " / " + extra.get(extraKey));
//				}
//			}
//		}
	}

	public static void debugUri(Uri uri) {
		debugUri(TAG, uri);
	}
	
	public static void debugUri(String tag, Uri uri) {
		if(TextUtils.isEmpty(tag)) {
			tag = TAG;
		}

		Log.i(tag, "debugUri(String tag, Uri uri) = " + uri);

		if(uri == null) {
			Log.w(tag, "if(uri == null)");
			return;
		}

		Log.d(tag, "uri.getScheme() = " + uri.getScheme());
		Log.d(tag, "uri.getSchemeSpecificPart() = " + uri.getSchemeSpecificPart());

		Log.d(tag, "uri.getHost() = " + uri.getHost());
		Log.d(tag, "uri.getPort() = " + uri.getPort());
		Log.d(tag, "uri.getPath() = " + uri.getPath());
		Log.d(tag, "uri.getLastPathSegment() = " + uri.getLastPathSegment());

		Log.d(tag, "uri.getQuery() = " + uri.getQuery());
		Log.d(tag, "uri.getQueryParameterNames() = " + uri.getQueryParameterNames());
		Set<String> keys = uri.getQueryParameterNames();
		Log.d(tag, "keys.size() = " + keys.size());
		for(String key : keys) {
			Log.d(tag, "key , value = " + key + " , " + uri.getQueryParameter(key));
		}

		Log.d(tag, "uri.getFragment() = " + uri.getFragment());

		Log.d(tag, "uri.getEncodedSchemeSpecificPart() = " + uri.getEncodedSchemeSpecificPart());
		Log.d(tag, "uri.getEncodedPath() = " + uri.getEncodedPath());
		Log.d(tag, "uri.getEncodedQuery() = " + uri.getEncodedQuery());
		Log.d(tag, "uri.getEncodedFragment() = " + uri.getEncodedFragment());
	}

	public static void debugBundle(String tag, Bundle bundle) {
		if(bundle == null) {
			Log.w(tag, "if(bundle == null)");
			return;
		}

		Set<String> keys = bundle.keySet();
		Log.d(tag, "bundle keys.size() = " + keys.size());

		for(String key : keys) {
			Object bundleObj = bundle.get(key);
			Log.d(tag, "key / value = " + key + " / " + bundleObj);

			if(bundleObj instanceof Bundle) {
				Bundle innerBundle = bundle.getBundle(key);
				debugBundle(tag, innerBundle);
			}
		}
	}
}
