package mcore.edu.demoGuide.patternlock.activity;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import java.util.List;

import m.client.android.library.core.common.CommonLibHandler;
import m.client.android.library.core.common.LibDefinitions;
import m.client.android.library.core.common.Parameters;
import m.client.android.library.core.utils.CommonLibUtil;
import m.client.android.library.core.utils.PLog;
import mcore.edu.demoGuide.R;
import mcore.edu.demoGuide.common.Const;
import mcore.edu.demoGuide.manager.InterfaceManager;
import mcore.edu.demoGuide.patternlock.PatternView;
import mcore.edu.demoGuide.patternlock.PatternView.Cell;
import mcore.edu.demoGuide.patternlock.PatternView.DisplayMode;
import mcore.edu.demoGuide.patternlock.PatternView.OnPatternListener;
import mcore.edu.demoGuide.patternlock.ViewAccessibilityCompat;
import mcore.edu.demoGuide.patternlock.util.PatternLockUtils;
import mcore.edu.demoGuide.patternlock.util.PreferenceContract;
import mcore.edu.demoGuide.patternlock.util.PreferenceUtils;

public class ConfirmPatternLayoutActivity extends Activity implements OnPatternListener {
	private static final String TAG = ConfirmPatternLayoutActivity.class.getSimpleName();

	private static final String KEY_NUM_FAILED_ATTEMPTS = "num_failed_attempts";
	public static final int RESULT_FORGOT_PASSWORD = 1;
	public static final int RESULT_PATTERN_REMOVE = 2;
	protected int numFailedAttempts;
	private static final int CLEAR_PATTERN_DELAY_MILLI = 2000;
	protected TextView messageText;
	protected PatternView patternView;
	protected LinearLayout buttonContainer;
	protected Button leftButton;
	protected Button rightButton;
	private final Runnable clearPatternRunnable = new Runnable() {
		public void run() {
			ConfirmPatternLayoutActivity.this.patternView.clearPattern();
		}
	};

	public ConfirmPatternLayoutActivity() {
	}

	protected void onCreate(Bundle savedInstanceState) {
		PLog.i(TAG, "onCreate(Bundle savedInstanceState)");
		requestWindowFeature(1);
		super.onCreate(savedInstanceState);
		setContentView(PatternLockUtils.getResID(this, "layout", "plugin_3rdparty_pattern_confirm_activity"));
		setTitleView();
		messageText = (TextView)findViewById(PatternLockUtils.getResID(this, "id", "pl_message_text"));
		patternView = (PatternView)findViewById(PatternLockUtils.getResID(this, "id", "pl_pattern"));
		buttonContainer = (LinearLayout)findViewById(PatternLockUtils.getResID(this, "id", "pl_button_container"));
		leftButton = (Button)findViewById(PatternLockUtils.getResID(this, "id", "pl_left_button"));
		rightButton = (Button)findViewById(PatternLockUtils.getResID(this, "id", "pl_right_button"));
		buttonContainer.setVisibility(View.GONE);
		messageText.setText(getString(PatternLockUtils.getResID(this, "string", "pl_pattern_drawing")));
		patternView.setInStealthMode(isStealthModeEnabled());
		patternView.setOnPatternListener(this);
		leftButton.setText(getString(PatternLockUtils.getResID(this, "string", "pl_cancel")));
		leftButton.setOnClickListener(new View.OnClickListener() {
			public void onClick(View v) {
				onCancel();
			}
		});
		rightButton.setText(getString(PatternLockUtils.getResID(this, "string", "pl_reset")));
		rightButton.setOnClickListener(new View.OnClickListener() {
			public void onClick(View v) {
				onForgotPassword();
			}
		});
		ViewAccessibilityCompat.announceForAccessibility(messageText, messageText.getText());
		if (savedInstanceState == null) {
			numFailedAttempts = 0;
		} else {
			numFailedAttempts = savedInstanceState.getInt("num_failed_attempts");
		}
	}

	protected boolean isStealthModeEnabled() {
		return !PreferenceUtils.getBoolean("pref_key_pattern_visible", PreferenceContract.DEFAULT_PATTERN_VISIBLE, this);
	}

	protected boolean isPatternCorrect(List<Cell> pattern) {
		return PatternLockUtils.isPatternCorrect(pattern, this);
	}

	protected void onForgotPassword() {
		InterfaceManager.getInstance().sendPatternResult(this, RESULT_OK, "FORGET_PASSWORD", "", "");
	}

	protected void onConfirmed() {
		InterfaceManager.getInstance().sendPatternResult(this, RESULT_OK, Const.SUCCESS,
				PreferenceUtils.getString("pref_key_pattern_sha256", PreferenceContract.DEFAULT_PATTERN_SHA256, this), "");
	}

	protected void onFailedPattern() {
		InterfaceManager.getInstance().sendPatternResult(this, RESULT_OK, "REMOVE", "", "");
	}

	protected void onCancel() {
		InterfaceManager.getInstance().sendPatternResult(this, RESULT_OK, Const.CANCEL, "", "");
	}

	protected void onSaveInstanceState(Bundle outState) {
		super.onSaveInstanceState(outState);
		outState.putInt("num_failed_attempts", numFailedAttempts);
	}

	public void onPatternStart() {
		removeClearPatternRunnable();
		patternView.setDisplayMode(DisplayMode.Correct);
	}

	public void onPatternCellAdded(List<Cell> pattern) {
	}

	public void onPatternDetected(List<Cell> pattern) {
		if (isPatternCorrect(pattern)) {
			onConfirmed();
		} else {
			onWrongPattern();
			if (numFailedAttempts < 5) {
				messageText.setVisibility(View.VISIBLE);
				messageText.setText(getString(PatternLockUtils.getResID(this, "string", "pl_retry_alert"), new Object[]{numFailedAttempts}));
				patternView.setDisplayMode(DisplayMode.Wrong);
				postClearPatternRunnable();
				ViewAccessibilityCompat.announceForAccessibility(messageText, messageText.getText());
			} else {
				onFailedPattern();
			}
		}

	}

	public void onPatternCleared() {
		removeClearPatternRunnable();
	}

	protected void onWrongPattern() {
		++numFailedAttempts;
	}

	public void onBackPressed() {
//		super.onBackPressed();
		onCancel();
	}

	protected void removeClearPatternRunnable() {
		patternView.removeCallbacks(clearPatternRunnable);
	}

	protected void postClearPatternRunnable() {
		removeClearPatternRunnable();
		patternView.postDelayed(clearPatternRunnable, 2000L);
	}

	// 페이지 이동
	private void movePageUrl(String url){
		Parameters param = new Parameters();
		param.putParam("TARGET_URL", url);
		//param.putParam("PARAMETERS", param.toString());
		CommonLibHandler.getInstance().getController().actionMoveActivity(LibDefinitions.libactivities.ACTY_MAIN,
				CommonLibUtil.getActionType(null),
				ConfirmPatternLayoutActivity.this,
				null,
				param);
	}

	// 앱 설치 여부
	public boolean isInstallApp(String pakageName){
		Intent intent = getPackageManager().getLaunchIntentForPackage(pakageName);
		if(intent==null){
			return false;
		}else{
			return true;
		}
	}

	private void setTitleView() {
		TextView txt_title = findViewById(R.id.txt_title);
		txt_title.setText("간편로그인");

		ImageView img_close = findViewById(R.id.img_close);
		img_close.setOnClickListener(new View.OnClickListener() {
			@Override
			public void onClick(View view) {
				onCancel();
			}
		});
	}
}
