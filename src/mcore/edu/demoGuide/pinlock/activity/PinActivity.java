package mcore.edu.demoGuide.pinlock.activity;

import android.app.Activity;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Log;
import android.view.View;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.core.content.ContextCompat;

import m.client.android.library.core.utils.CommonLibUtil;
import m.client.android.library.core.utils.PLog;
import m.client.android.library.core.utils.Utils;
import mcore.edu.demoGuide.R;
import mcore.edu.demoGuide.common.Const;
import mcore.edu.demoGuide.manager.InterfaceManager;
import mcore.edu.demoGuide.pinlock.IndicatorDots;
import mcore.edu.demoGuide.pinlock.PinLockListener;
import mcore.edu.demoGuide.pinlock.PinLockView;

public class PinActivity extends Activity {
    public static final String TAG = "PinLockView";
    private PinLockView mPinLockView;
    private IndicatorDots mIndicatorDots;
    protected int numFailedAttempts;

    private String pinReg; //핀 등록 요청 여부 (한번이라도 있을 경우: true)

    private PinLockListener mPinLockListener = new PinLockListener() {
        public void onComplete(String pin) {
            Log.d("PinLockView", "Pin complete: " + pin);
            String command = getIntent().getStringExtra("command");
            String length = getIntent().getStringExtra("length");
            if (!TextUtils.isEmpty(command)) {
                String oldPin;
                if (command.equals("REGISTER")) {
                    oldPin = getIntent().getStringExtra("pin");
                    if (TextUtils.isEmpty(oldPin)) {
                        TextView pin_descript = (TextView) findViewById(Utils.getDynamicID(getApplicationContext(), "id", "pin_descript"));
                        if (pin_descript != null) {
                            pin_descript.setText(getString(Utils.getDynamicID(getApplicationContext(), "string", "register_descript_2")));
                        }

                        setGuideView(command, "REG_CONFIRM");

                        mPinLockView.resetPinLockView();
                        getIntent().putExtra("pin", pin);
                    } else if (oldPin.equals(pin)) {
                        CommonLibUtil.setVariableToStorage("pin", pin, getApplicationContext(), true);
                        CommonLibUtil.setUserConfigInfomation("pinReg", "true", getApplicationContext());
                        InterfaceManager.getInstance().sendPinResult(PinActivity.this, RESULT_OK, Const.SUCCESS,
                                CommonLibUtil.getVariableFromStorageEncValue("pin", getApplicationContext()), "");
                    } else {
////                        CommonLibUtil.setVariableToStorage("pin", pin, getApplicationContext(), true);
////                        InterfaceManager.getInstance().sendPinResult(PinActivity.this, RESULT_OK, Const.FAIL, "", "");
//                        TextView pin_descript = (TextView) findViewById(Utils.getDynamicID(getApplicationContext(), "id", "pin_descript"));
//                        if (pin_descript != null) {
//                            pin_descript.setVisibility(View.VISIBLE);
//                            pin_descript.setText(getString(Utils.getDynamicID(getApplicationContext(), "string", "register_descript_retry")));
//                        }
//
//                        mPinLockView.resetPinLockView();
////                        getIntent().putExtra("pin", "");

                        onWrongPin();
                        if (numFailedAttempts < 5) {
                            TextView pin_descript = (TextView)findViewById(Utils.getDynamicID(getApplicationContext(), "id", "pin_descript"));
                            pin_descript.setText(getString(Utils.getDynamicID(getApplicationContext(), "string", "auth_descript_retry"), new Object[]{numFailedAttempts}));
                            pin_descript.setVisibility(View.VISIBLE);
                            int color = ContextCompat.getColor(getApplicationContext(), R.color.pin_error_text_color);
                            pin_descript.setTextColor(color);
                            mPinLockView.resetPinLockView();
                        } else {
                            InterfaceManager.getInstance().sendPinResult(PinActivity.this, RESULT_OK, Const.FAIL, "", "");
                        }
                    }
                } else if (command.equals("AUTH")) {
                    oldPin = pinReg.equals("true")?CommonLibUtil.getVariableFromStorage("pin", getApplicationContext(), true):"";
                    if (!TextUtils.isEmpty(oldPin)) {
                        if (oldPin.equals(pin)) {
                            InterfaceManager.getInstance().sendPinResult(PinActivity.this, RESULT_OK, Const.SUCCESS,
                                    CommonLibUtil.getVariableFromStorageEncValue("pin", getApplicationContext()), "");
                        } else {
                            onWrongPin();
                            if (numFailedAttempts < 5) {
                                TextView pin_descript = (TextView)findViewById(Utils.getDynamicID(getApplicationContext(), "id", "pin_descript"));
                                pin_descript.setText(getString(Utils.getDynamicID(getApplicationContext(), "string", "auth_descript_retry"), new Object[]{numFailedAttempts}));
                                pin_descript.setVisibility(View.VISIBLE);
                                int color = ContextCompat.getColor(getApplicationContext(), R.color.pin_error_text_color);
                                pin_descript.setTextColor(color);
                                mPinLockView.resetPinLockView();
                            } else {
                                InterfaceManager.getInstance().sendPinResult(PinActivity.this, RESULT_OK, Const.FAIL, "", "");
                            }
                        }
                    }
                }
            }

        }

        public void onEmpty() {
            Log.d("PinLockView", "Pin empty");
        }

        public void onPinChange(int pinLength, String intermediatePin) {
            Log.d("PinLockView", "Pin changed, new length " + pinLength + " with intermediate pin " + intermediatePin);
        }
    };

    protected void onWrongPin() {
        ++numFailedAttempts;
    }

    public PinActivity() {
    }

    protected void onCreate(Bundle savedInstanceState) {
        PLog.i(TAG, "onCreate(Bundle savedInstanceState)");

        super.onCreate(savedInstanceState);
        requestWindowFeature(1);
        getWindow().setFlags(1024, 1024);
        setContentView(Utils.getDynamicID(getApplicationContext(), "layout", "plugin_3rdparty_pin_activity"));

        pinReg = CommonLibUtil.getUserConfigInfomation("pinReg", getApplicationContext());

        mPinLockView = (PinLockView)findViewById(Utils.getDynamicID(getApplicationContext(), "id", "pin_lock_view"));
        mIndicatorDots = (IndicatorDots)findViewById(Utils.getDynamicID(getApplicationContext(), "id", "indicator_dots"));
        mPinLockView.attachIndicatorDots(mIndicatorDots);
        mPinLockView.setPinLockListener(mPinLockListener);

        try {
            mPinLockView.setPinLength(Integer.parseInt(getIntent().getStringExtra("length")));
        } catch (Exception var7) {
            mPinLockView.setPinLength(Integer.parseInt("4"));
        }

//        mPinLockView.setTextColor(getResources().getColor(Utils.getDynamicID(getApplicationContext(), "color", "keypadTextColor")));
        mIndicatorDots.setIndicatorType(0);
        String command = getIntent().getStringExtra("command");
        String maxlength = getIntent().getStringExtra("length");

        TextView pin_descript = (TextView)findViewById(Utils.getDynamicID(getApplicationContext(), "id", "pin_descript"));
        if (pin_descript != null) {
            if (command.equals("REGISTER")) {
                setTitleView("간편로그인 설정");
                setGuideView(command, "REG_NEW");
                String pinNumber = getIntent().getStringExtra("pin");
                if (TextUtils.isEmpty(pinNumber)) {
                    pin_descript.setText(getString(Utils.getDynamicID(getApplicationContext(), "string", "register_descript_1")));
                } else {
                    pin_descript.setText(getString(Utils.getDynamicID(getApplicationContext(), "string", "register_descript_2")));
                }
            } else if (command.equals("AUTH")) {
                setTitleView("간편로그인");
                setGuideView(command, null);
                String oldPin = pinReg.equals("true")?CommonLibUtil.getVariableFromStorage("pin", getApplicationContext(), true):"";
                if (TextUtils.isEmpty(oldPin)) {
                    InterfaceManager.getInstance().sendPinResult(PinActivity.this, RESULT_OK, Const.FAIL, "", "등록된 핀이 없습니다.");
                    return;
                }
                pin_descript.setText(getString(Utils.getDynamicID(getApplicationContext(), "string", "auth_descript")));
            } else if (command.equals("REMOVE")) {
                CommonLibUtil.setVariableToStorage("pin", "", getApplicationContext(), true);
                InterfaceManager.getInstance().sendPinResult(PinActivity.this, RESULT_OK, Const.SUCCESS, "", "");
            } else if (command.equals("GET")) {
                String encPin="";
                if(pinReg.equals("true")){
                    if(!CommonLibUtil.getVariableFromStorage("pin", getApplicationContext(), true).equals("")){
                        encPin = CommonLibUtil.getVariableFromStorageEncValue("pin", getApplicationContext());
                    }
                }
                InterfaceManager.getInstance().sendPinResult(PinActivity.this, Const.REQ_AUTH_PIN_GET, Const.SUCCESS,
                        pinReg.equals("true")?encPin:"", "");
            }
        }
    }

    @Override
    public void onBackPressed() {
//        super.onBackPressed();
        onCancel();
    }

    protected void onCancel() {
        InterfaceManager.getInstance().sendPinResult(PinActivity.this, RESULT_OK, Const.CANCEL, "", "");
    }

    private void setTitleView(String title) {
        TextView txt_title = findViewById(R.id.txt_title);
        txt_title.setText(title);

        ImageView img_close = findViewById(R.id.img_close);
        img_close.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                onCancel();
            }
        });
    }

    private void setGuideView(String command, String regType) {
        // 오류 문구는 여기서 관리하지 않는다. 안내문구만 함.
        // 등록(REGISTER)
        // 초기기 pin 번호 입력 - PIN번호 등록, 사용하실 PIN번호 ... 주세요.
        // or 확인 입력 - PIN번호 재입력, 확인을 위해
        // 인증(AUTH)
        // pin 번호 입력이면 안내문구 - PIN번호 숫자 4자리를 입력 해 주세요.
        TextView txt_pin_guide_title = findViewById(R.id.txt_pin_guide_title);
        TextView txt_pin_guide_text = findViewById(R.id.txt_pin_guide_text);

        if("AUTH".equalsIgnoreCase(command)) {
            txt_pin_guide_title.setVisibility(View.INVISIBLE);
            txt_pin_guide_text.setText(R.string.pin_auth_guide);
        } else {
            txt_pin_guide_title.setVisibility(View.VISIBLE);
            // 최초 PIN 등록
            if("REG_NEW".equalsIgnoreCase(regType)) {
                txt_pin_guide_title.setText(R.string.pin_reg_new_title);
                txt_pin_guide_text.setText(R.string.pin_reg_new_guide);
            }
            // PIN 확인
            else if("REG_CONFIRM".equalsIgnoreCase(regType)) {
                txt_pin_guide_title.setText(R.string.pin_reg_confirm_title);
                txt_pin_guide_text.setText(R.string.pin_reg_confirm_guide);
            }
        }
    }

}
