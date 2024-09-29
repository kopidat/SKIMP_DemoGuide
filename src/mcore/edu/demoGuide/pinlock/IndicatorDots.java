package mcore.edu.demoGuide.pinlock;

import android.animation.LayoutTransition;
import android.annotation.SuppressLint;
import android.content.Context;
import android.content.res.TypedArray;
import android.util.AttributeSet;
import android.util.LayoutDirection;
import android.view.View;
import android.widget.LinearLayout;

import androidx.core.view.ViewCompat;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

import m.client.android.library.core.utils.Utils;

public class IndicatorDots  extends LinearLayout {
    private static final int DEFAULT_PIN_LENGTH = 4;
    private int mDotDiameter;
    private int mDotSpacing;
    private int mFillDrawable;
    private int mEmptyDrawable;
    private int mPinLength;
    private int mIndicatorType;
    private int mPreviousLength;

    public IndicatorDots(Context context) {
        this(context, (AttributeSet)null);
    }

    public IndicatorDots(Context context, AttributeSet attrs) {
        this(context, attrs, 0);
    }

    public IndicatorDots(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        int[] arrayid = Utils.getDynamicArray(context, "styleable", "IndicatorDots");
        TypedArray typedArray = context.obtainStyledAttributes(attrs, arrayid);

        try {
            mDotDiameter = (int)typedArray.getDimension(Utils.getDynamicID(context, "styleable", "IndicatorDots_dotDiameter"), ResourceUtils.getDimensionInPx(getContext(), Utils.getDynamicID(context, "dimen", "default_dot_diameter")));
            mDotSpacing = (int)typedArray.getDimension(Utils.getDynamicID(context, "styleable", "IndicatorDots_dotSpacing"), ResourceUtils.getDimensionInPx(getContext(), Utils.getDynamicID(context, "dimen", "default_dot_spacing")));
            mFillDrawable = typedArray.getResourceId(Utils.getDynamicID(context, "styleable", "IndicatorDots_dotFilledBackground"), Utils.getDynamicID(context, "drawable", "plugin_3rdparty_pin_dot_filled"));
            mEmptyDrawable = typedArray.getResourceId(Utils.getDynamicID(context, "styleable", "IndicatorDots_dotEmptyBackground"), Utils.getDynamicID(context, "drawable", "plugin_3rdparty_pin_dot_empty"));
//            mPinLength = typedArray.getInt(Utils.getDynamicID(context, "styleable", "PinLockView_pinLength"), 4);
            mIndicatorType = typedArray.getInt(Utils.getDynamicID(context, "styleable", "IndicatorDots_indicatorType"), 0);
        } finally {
            typedArray.recycle();
        }

        initView(context);
    }

    @SuppressLint("WrongConstant")
    private void initView(Context context) {
        ViewCompat.setLayoutDirection(this, LayoutDirection.LTR);
        if (mIndicatorType == 0) {
            for(int i = 0; i < mPinLength; ++i) {
                View dot = new View(context);
                emptyDot(dot);
                LayoutParams params = new LayoutParams(mDotDiameter, mDotDiameter);
                params.setMargins(mDotSpacing, 0, mDotSpacing, 0);
                dot.setLayoutParams(params);
                addView(dot);
            }
        } else if (mIndicatorType == 2) {
            setLayoutTransition(new LayoutTransition());
        }

    }

    protected void onAttachedToWindow() {
        super.onAttachedToWindow();
        if (mIndicatorType != 0) {
            android.view.ViewGroup.LayoutParams params = getLayoutParams();
            params.height = mDotDiameter;
            requestLayout();
        }

    }

    void updateDot(int length) {
        if (mIndicatorType == 0) {
            if (length > 0) {
                if (length > mPreviousLength) {
                    fillDot(getChildAt(length - 1));
                } else {
                    emptyDot(getChildAt(length));
                }

                mPreviousLength = length;
            } else {
                for(int i = 0; i < getChildCount(); ++i) {
                    View v = getChildAt(i);
                    emptyDot(v);
                }

                mPreviousLength = 0;
            }
        } else if (length > 0) {
            if (length > mPreviousLength) {
                View dot = new View(getContext());
                fillDot(dot);
                LayoutParams params = new LayoutParams(mDotDiameter, mDotDiameter);
                params.setMargins(mDotSpacing, 0, mDotSpacing, 0);
                dot.setLayoutParams(params);
                addView(dot, length - 1);
            } else {
                removeViewAt(length);
            }

            mPreviousLength = length;
        } else {
            removeAllViews();
            mPreviousLength = 0;
        }

    }

    private void emptyDot(View dot) {
        dot.setBackgroundResource(mEmptyDrawable);
    }

    private void fillDot(View dot) {
        dot.setBackgroundResource(mFillDrawable);
    }

    public int getPinLength() {
        return mPinLength;
    }

    public void setPinLength(int pinLength) {
        mPinLength = pinLength;
        removeAllViews();
        initView(getContext());
    }

    public int getIndicatorType() {
        return mIndicatorType;
    }

    public void setIndicatorType(int type) {
        mIndicatorType = type;
        removeAllViews();
        initView(getContext());
    }

    @Retention(RetentionPolicy.SOURCE)
    public @interface IndicatorType {
        int FIXED = 0;
        int FILL = 1;
        int FILL_WITH_ANIMATION = 2;
    }
}
