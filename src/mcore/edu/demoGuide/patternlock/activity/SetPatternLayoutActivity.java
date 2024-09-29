package mcore.edu.demoGuide.patternlock.activity;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.core.content.ContextCompat;

import java.util.ArrayList;
import java.util.List;

import m.client.android.library.core.common.CommonLibHandler;
import m.client.android.library.core.common.LibDefinitions;
import m.client.android.library.core.common.Parameters;
import m.client.android.library.core.utils.CommonLibUtil;
import m.client.android.library.core.utils.PLog;
import mcore.edu.demoGuide.R;
import mcore.edu.demoGuide.common.Const;
import mcore.edu.demoGuide.manager.InterfaceManager;
import mcore.edu.demoGuide.patternlock.PatternUtils;
import mcore.edu.demoGuide.patternlock.PatternView;
import mcore.edu.demoGuide.patternlock.PatternView.Cell;
import mcore.edu.demoGuide.patternlock.ViewAccessibilityCompat;
import mcore.edu.demoGuide.patternlock.util.PatternLockUtils;
import mcore.edu.demoGuide.patternlock.util.PreferenceContract;
import mcore.edu.demoGuide.patternlock.util.PreferenceUtils;

public class SetPatternLayoutActivity extends Activity implements PatternView.OnPatternListener {
	private static final String TAG = SetPatternLayoutActivity.class.getSimpleName();

	private static final int MIN_PATTERN_SIZE = 4;

	static Context context = CommonLibHandler.getInstance().getApplicationContext();
	static int pl_cancel;
	static int pl_redraw;
	static int pl_continue;
	static int pl_confirm;
	static int pl_draw_pattern;
	static int pl_confirm_pattern;
	static int pl_pattern_too_short;
	static int pl_pattern_recorded;
	static int pl_wrong_pattern;
	static int pl_pattern_confirmed;
	static int pl_recording_pattern;
	private static final int CLEAR_PATTERN_DELAY_MILLI = 2000;
	protected TextView messageText;
	protected PatternView patternView;
	protected LinearLayout buttonContainer;
	protected Button leftButton;
	protected Button rightButton;
	protected ImageView barStep;
	private final Runnable clearPatternRunnable = new Runnable() {
		public void run() {
			SetPatternLayoutActivity.this.patternView.clearPattern();
		}
	};
	private static final String KEY_STAGE = "stage";
	private static final String KEY_PATTERN = "pattern";
	private int minPatternSize;
	private List<Cell> pattern;
	private Stage stage;

	static {
		pl_cancel = PatternLockUtils.getResID(context, "string", "pl_cancel");
		pl_redraw = PatternLockUtils.getResID(context, "string", "pl_redraw");
		pl_continue = PatternLockUtils.getResID(context, "string", "pl_continue");
		pl_confirm = PatternLockUtils.getResID(context, "string", "pl_confirm");
		pl_draw_pattern = PatternLockUtils.getResID(context, "string", "pl_draw_pattern");
		pl_confirm_pattern = PatternLockUtils.getResID(context, "string", "pl_confirm_pattern");
		pl_pattern_too_short = PatternLockUtils.getResID(context, "string", "pl_pattern_too_short");
		pl_pattern_recorded = PatternLockUtils.getResID(context, "string", "pl_pattern_recorded");
		pl_wrong_pattern = PatternLockUtils.getResID(context, "string", "pl_wrong_pattern");
		pl_pattern_confirmed = PatternLockUtils.getResID(context, "string", "pl_pattern_confirmed");
		pl_recording_pattern = PatternLockUtils.getResID(context, "string", "pl_recording_pattern");
	}

	protected int numFailedAttempts;

	public SetPatternLayoutActivity() {
	}

	protected void onCreate(Bundle savedInstanceState) {
		PLog.i(TAG, "onCreate(Bundle savedInstanceState)");
		requestWindowFeature(1);
		super.onCreate(savedInstanceState);
		setContentView(PatternLockUtils.getResID(this, "layout", "plugin_3rdparty_pattern_set_activity"));
		setTitleView();
		messageText = (TextView)findViewById(PatternLockUtils.getResID(this, "id", "pl_message_text"));
		patternView = (PatternView)findViewById(PatternLockUtils.getResID(this, "id", "pl_pattern"));
		buttonContainer = (LinearLayout)findViewById(PatternLockUtils.getResID(this, "id", "pl_button_container"));
		leftButton = (Button)findViewById(PatternLockUtils.getResID(this, "id", "pl_left_button"));
		rightButton = (Button)findViewById(PatternLockUtils.getResID(this, "id", "pl_right_button"));
		minPatternSize = getMinPatternSize();
		patternView.setOnPatternListener(this);
		leftButton.setOnClickListener(new View.OnClickListener() {
			public void onClick(View v) {
				onLeftButtonClicked();
			}
		});
		rightButton.setOnClickListener(new View.OnClickListener() {
			public void onClick(View v) {
				onRightButtonClicked();
			}
		});
		if (savedInstanceState == null) {
			updateStage(Stage.Draw);
		} else {
			String patternString = savedInstanceState.getString("pattern");
			if (patternString != null) {
				pattern = PatternUtils.stringToPattern(patternString);
			}

			updateStage(Stage.values()[savedInstanceState.getInt("stage")]);
		}
	}

	protected void removeClearPatternRunnable() {
		patternView.removeCallbacks(clearPatternRunnable);
	}

	protected void postClearPatternRunnable() {
		removeClearPatternRunnable();
		patternView.postDelayed(clearPatternRunnable, 2000L);
	}

	public void onSaveInstanceState(Bundle outState) {
		super.onSaveInstanceState(outState);
		outState.putInt("stage", stage.ordinal());
		if (pattern != null) {
			outState.putString("pattern", PatternUtils.patternToString(pattern));
		}

	}

	public void onPatternStart() {
		removeClearPatternRunnable();
//		messageText.setText(pl_recording_pattern);
		patternView.setDisplayMode(PatternView.DisplayMode.Correct);
		leftButton.setEnabled(false);
		rightButton.setEnabled(false);
	}

	public void onPatternCellAdded(List<Cell> pattern) {
	}

	public void onPatternDetected(List<Cell> newPattern) {
		PLog.i(TAG, "onPatternDetected(List<Cell> newPattern) = " + newPattern);
		PLog.d(TAG, "stage = " + stage);
		switch(stage) {
			case Draw:
			case DrawTooShort:
				if (newPattern.size() < minPatternSize) {
					updateStage(Stage.DrawTooShort);
				} else {
					pattern = new ArrayList(newPattern);
					updateStage(Stage.DrawValid);
				}
				break;
			case DrawValid:
			default:
				throw new IllegalStateException("Unexpected stage " + stage + " when " + "entering the pattern.");
			case Confirm:
			case ConfirmWrong:
				if (newPattern.equals(pattern)) {
					updateStage(Stage.ConfirmCorrect);
				} else {
					updateStage(Stage.ConfirmWrong);
				}
		}
	}

	public void onPatternCleared() {
		removeClearPatternRunnable();
	}

	private void onLeftButtonClicked() {
		/*if (stage.leftButtonState == SetPatternLayoutActivity.LeftButtonState.Redraw) {
			pattern = null;
			updateStage(Stage.Draw);
		} else {
			if (stage.leftButtonState != SetPatternLayoutActivity.LeftButtonState.Cancel) {
				throw new IllegalStateException("left footer button pressed, but stage of " + stage + " doesn't make sense");
			}

			onCancel();
		}*/

		onCancel();
	}

	private void onRightButtonClicked() {
		if (stage.rightButtonState == RightButtonState.Continue) {
			if (stage != Stage.DrawValid) {
				throw new IllegalStateException("expected ui stage " + Stage.DrawValid + " when button is " + RightButtonState.Continue);
			}

			updateStage(Stage.Confirm);
		} else if (stage.rightButtonState == RightButtonState.Confirm) {
			if (stage != Stage.ConfirmCorrect) {
				throw new IllegalStateException("expected ui stage " + Stage.ConfirmCorrect + " when button is " + RightButtonState.Confirm);
			}

			onSetPattern(pattern);
		}

	}

	private void updateStage(Stage newStage) {
		Stage previousStage = stage;
		stage = newStage;
//		if (stage == Stage.DrawTooShort) {
//			messageText.setText(getString(stage.messageId, new Object[]{minPatternSize}));
//		} else {
//			messageText.setText(stage.messageId);
//			messageText.setText(getString(stage.messageId, new Object[]{minPatternSize}));
//		}

		messageText.setText(stage.messageId);

//		leftButton.setText(stage.leftButtonState.textId);
		leftButton.setEnabled(stage.leftButtonState.enabled);
		rightButton.setText(stage.rightButtonState.textId);
		rightButton.setEnabled(stage.rightButtonState.enabled);
		patternView.setInputEnabled(stage.patternEnabled);
		switch(stage) {
			case Draw:
				patternView.clearPattern();
				break;
			case DrawTooShort:
				patternView.setDisplayMode(PatternView.DisplayMode.Wrong);
				postClearPatternRunnable();
				break;
			case DrawValid:
			case ConfirmCorrect:
				onRightButtonClicked();
				break;
			case Confirm:
				patternView.clearPattern();
				break;
			case ConfirmWrong:
//				patternView.setDisplayMode(PatternView.DisplayMode.Wrong);
//				postClearPatternRunnable();
				onWrongPattern();
				int color = ContextCompat.getColor(getApplicationContext(), R.color.pl_error_text_color);
				messageText.setTextColor(color);
				messageText.setText(getString(stage.messageId, new Object[]{numFailedAttempts}));
				if (numFailedAttempts < 5) {
					patternView.setDisplayMode(PatternView.DisplayMode.Wrong);
					postClearPatternRunnable();
				} else {
					onCancel();
				}
				break;
			default:
				break;
		}

		if (previousStage != stage) {
			ViewAccessibilityCompat.announceForAccessibility(messageText, messageText.getText());
		}

	}

	protected int getMinPatternSize() {
		return MIN_PATTERN_SIZE;
	}

	public void onBackPressed() {
//		super.onBackPressed();
		onCancel();
	}

	protected void onSetPattern(List<Cell> pattern) {
		PatternLockUtils.setPattern(pattern, this);
		InterfaceManager.getInstance().sendPatternResult(this, RESULT_OK, Const.SUCCESS,
				PreferenceUtils.getString("pref_key_pattern_sha256", PreferenceContract.DEFAULT_PATTERN_SHA256, this), "");
	}

	protected void onCancel() {
		InterfaceManager.getInstance().sendPatternResult(this, RESULT_OK, Const.CANCEL, "", "");
	}

	private static enum LeftButtonState {
		Cancel(SetPatternLayoutActivity.pl_cancel, true),
		CancelDisabled(SetPatternLayoutActivity.pl_cancel, false),
		Redraw(SetPatternLayoutActivity.pl_redraw, true),
		RedrawDisabled(SetPatternLayoutActivity.pl_redraw, false);

		public final int textId;
		public final boolean enabled;

		private LeftButtonState(int textId, boolean enabled) {
			this.textId = textId;
			this.enabled = enabled;
		}
	}

	private static enum RightButtonState {
		Continue(SetPatternLayoutActivity.pl_continue, true),
		ContinueDisabled(SetPatternLayoutActivity.pl_continue, false),
		Confirm(SetPatternLayoutActivity.pl_confirm, true),
		ConfirmDisabled(SetPatternLayoutActivity.pl_confirm, false);

		public final int textId;
		public final boolean enabled;

		private RightButtonState(int textId, boolean enabled) {
			this.textId = textId;
			this.enabled = enabled;
		}
	}

	private static enum Stage {
		Draw(SetPatternLayoutActivity.pl_draw_pattern, LeftButtonState.Cancel, RightButtonState.ContinueDisabled, true),
		DrawTooShort(SetPatternLayoutActivity.pl_pattern_too_short, LeftButtonState.Redraw, RightButtonState.ContinueDisabled, true),
		DrawValid(SetPatternLayoutActivity.pl_pattern_recorded, LeftButtonState.Redraw, RightButtonState.Continue, false),
		Confirm(SetPatternLayoutActivity.pl_confirm_pattern, LeftButtonState.Cancel, RightButtonState.ConfirmDisabled, true),
		ConfirmWrong(SetPatternLayoutActivity.pl_wrong_pattern, LeftButtonState.Cancel, RightButtonState.ConfirmDisabled, true),
		ConfirmCorrect(SetPatternLayoutActivity.pl_pattern_confirmed, LeftButtonState.Cancel, RightButtonState.Confirm, false);

		public final int messageId;
		public final LeftButtonState leftButtonState;
		public final RightButtonState rightButtonState;
		public final boolean patternEnabled;

		private Stage(int messageId, LeftButtonState leftButtonState, RightButtonState rightButtonState, boolean patternEnabled) {
			this.messageId = messageId;
			this.leftButtonState = leftButtonState;
			this.rightButtonState = rightButtonState;
			this.patternEnabled = patternEnabled;
		}
	}

	// 페이지 이동
	private void movePageUrl(String url){
		Parameters param = new Parameters();
		param.putParam("TARGET_URL", url);
		//param.putParam("PARAMETERS", param.toString());
		CommonLibHandler.getInstance().getController().actionMoveActivity(LibDefinitions.libactivities.ACTY_MAIN,
				CommonLibUtil.getActionType(null),
				SetPatternLayoutActivity.this,
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
		txt_title.setText("간편로그인 설정");

		ImageView img_close = findViewById(R.id.img_close);
		img_close.setOnClickListener(new View.OnClickListener() {
			@Override
			public void onClick(View view) {
				onCancel();
			}
		});
	}

	protected void onWrongPattern() {
		++numFailedAttempts;
	}
}
