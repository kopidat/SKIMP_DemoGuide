package mcore.edu.demoGuide.patternlock.util;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.text.TextUtils;

import java.util.List;

import mcore.edu.demoGuide.patternlock.PatternUtils;
import mcore.edu.demoGuide.patternlock.PatternView;
import mcore.edu.demoGuide.patternlock.activity.ConfirmPatternLayoutActivity;
import mcore.edu.demoGuide.patternlock.activity.SetPatternLayoutActivity;

public class PatternLockUtils {
	
	public static final int REQUEST_CODE_CONFIRM_PATTERN = 19951208;
	
	public static void setPattern(List<PatternView.Cell> pattern, Context context) {
		PreferenceUtils.putString(PreferenceContract.KEY_PATTERN_SHA256,
				PatternUtils.patternToSha1String(pattern), context);
	}
	
	private static String getPatternSha256(Context context) {
		return PreferenceUtils.getString(PreferenceContract.KEY_PATTERN_SHA256,
				PreferenceContract.DEFAULT_PATTERN_SHA256, context);
	}
	
	public static boolean hasPattern(Context context) {
		return !TextUtils.isEmpty(getPatternSha256(context));
	}
	
	public static boolean isPatternCorrect(List<PatternView.Cell> pattern, Context context) {
		return TextUtils.equals(PatternUtils.patternToSha1String(pattern), getPatternSha256(context));
	}
	
	public static void clearPattern(Context context) {
		PreferenceUtils.remove(PreferenceContract.KEY_PATTERN_SHA256, context);
	}
	
	public static void setPatternByUser(Context context) {
		context.startActivity(new Intent(context, SetPatternLayoutActivity.class));
	}
	
	// NOTE: Should only be called when there is a pattern for this account.
	public static void confirmPattern(Activity activity, int requestCode) {
		activity.startActivityForResult(new Intent(activity, ConfirmPatternLayoutActivity.class),
				requestCode);
	}
	
	public static void confirmPattern(Activity activity) {
		confirmPattern(activity, REQUEST_CODE_CONFIRM_PATTERN);
	}
	
	public static void confirmPatternIfHas(Activity activity) {
		if (hasPattern(activity)) {
			confirmPattern(activity, REQUEST_CODE_CONFIRM_PATTERN);
		}
	}
	
	public static boolean checkConfirmPatternResult(Activity activity, int requestCode,
                                                    int resultCode) {
		if (requestCode == REQUEST_CODE_CONFIRM_PATTERN && resultCode != Activity.RESULT_OK) {
			activity.finish();
			return true;
		} else {
			return false;
		}
	}

	public static int getResID(Context context, String defType, String name) {
		return context.getResources().getIdentifier(name, defType, context.getPackageName());
	}
	
	private PatternLockUtils() {}
}
