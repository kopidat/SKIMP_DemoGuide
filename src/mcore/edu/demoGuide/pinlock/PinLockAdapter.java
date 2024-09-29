package mcore.edu.demoGuide.pinlock;

import android.content.Context;
import android.os.Build;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;

import androidx.recyclerview.widget.RecyclerView;

import m.client.android.library.core.utils.Utils;

public class PinLockAdapter  extends RecyclerView.Adapter<RecyclerView.ViewHolder> {
    private static final int VIEW_TYPE_NUMBER = 0;
    private static final int VIEW_TYPE_DELETE = 1;
    private Context mContext;
    private CustomizationOptionsBundle mCustomizationOptionsBundle;
    private OnNumberClickListener mOnNumberClickListener;
    private OnDeleteClickListener mOnDeleteClickListener;
    private int mPinLength;
    private int[] mKeyValues;

    public PinLockAdapter(Context context) {
        this.mContext = context;
        this.mKeyValues = getAdjustKeyValues(new int[]{1, 2, 3, 4, 5, 6, 7, 8, 9, 0});
    }

    public RecyclerView.ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        LayoutInflater inflater = LayoutInflater.from(parent.getContext());
        Object viewHolder;
        int id;
        View view;
        if (viewType == 0) {
            id = Utils.getDynamicID(parent.getContext(), "layout", "plugin_3rdparty_pin_layout_number_item");
            view = inflater.inflate(id, parent, false);
            viewHolder = new NumberViewHolder(view);
        } else {
            id = Utils.getDynamicID(parent.getContext(), "layout", "plugin_3rdparty_pin_layout_delete_item");
            view = inflater.inflate(id, parent, false);
            viewHolder = new DeleteViewHolder(view);
        }

        return (RecyclerView.ViewHolder)viewHolder;
    }

    public void onBindViewHolder(RecyclerView.ViewHolder holder, int position) {
        if (holder.getItemViewType() == 0) {
            NumberViewHolder vh1 = (NumberViewHolder)holder;
            configureNumberButtonHolder(vh1, position);
        } else if (holder.getItemViewType() == 1) {
            DeleteViewHolder vh2 = (DeleteViewHolder)holder;
            configureDeleteButtonHolder(vh2);
        }

    }

    private void configureNumberButtonHolder(NumberViewHolder holder, int position) {
        if (holder != null) {
            if (position == 9) {
                holder.mNumberButton.setVisibility(View.GONE);
            } else {
                holder.mNumberButton.setText(String.valueOf(mKeyValues[position]));
                holder.mNumberButton.setVisibility(View.VISIBLE);
                holder.mNumberButton.setTag(mKeyValues[position]);
            }

            if (mCustomizationOptionsBundle != null) {
                holder.mNumberButton.setTextColor(mCustomizationOptionsBundle.getTextColor());
                if (mCustomizationOptionsBundle.getButtonBackgroundDrawable() != null) {
                    if (Build.VERSION.SDK_INT < 16) {
                        holder.mNumberButton.setBackgroundDrawable(mCustomizationOptionsBundle.getButtonBackgroundDrawable());
                    } else {
                        holder.mNumberButton.setBackground(mCustomizationOptionsBundle.getButtonBackgroundDrawable());
                    }
                }

                holder.mNumberButton.setTextSize(0, (float)mCustomizationOptionsBundle.getTextSize());
                LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(mCustomizationOptionsBundle.getButtonSize(), mCustomizationOptionsBundle.getButtonSize());
                holder.mNumberButton.setLayoutParams(params);
            }
        }

    }

    private void configureDeleteButtonHolder(DeleteViewHolder holder) {
        if (holder != null) {
            if (mCustomizationOptionsBundle.isShowDeleteButton() && mPinLength > 0) {
                holder.mButtonImage.setVisibility(View.VISIBLE);
                if (mCustomizationOptionsBundle.getDeleteButtonDrawable() != null) {
                    holder.mButtonImage.setImageDrawable(mCustomizationOptionsBundle.getDeleteButtonDrawable());
                }

//                holder.mButtonImage.setColorFilter(mCustomizationOptionsBundle.getTextColor(), PorterDuff.Mode.SRC_ATOP);
//                LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(mCustomizationOptionsBundle.getDeleteButtonSize(), mCustomizationOptionsBundle.getDeleteButtonSize());
//                holder.mButtonImage.setLayoutParams(params);
            } else {
//                holder.mButtonImage.setVisibility(View.GONE);
            }
        }

    }

    public int getItemCount() {
        return 12;
    }

    public int getItemViewType(int position) {
        return position == getItemCount() - 1 ? 1 : 0;
    }

    public int getPinLength() {
        return mPinLength;
    }

    public void setPinLength(int pinLength) {
        this.mPinLength = pinLength;
    }

    public int[] getKeyValues() {
        return mKeyValues;
    }

    public void setKeyValues(int[] keyValues) {
        mKeyValues = getAdjustKeyValues(keyValues);
        notifyDataSetChanged();
    }

    private int[] getAdjustKeyValues(int[] keyValues) {
        int[] adjustedKeyValues = new int[keyValues.length + 1];

        for(int i = 0; i < keyValues.length; ++i) {
            if (i < 9) {
                adjustedKeyValues[i] = keyValues[i];
            } else {
                adjustedKeyValues[i] = -1;
                adjustedKeyValues[i + 1] = keyValues[i];
            }
        }

        return adjustedKeyValues;
    }

    public OnNumberClickListener getOnItemClickListener() {
        return mOnNumberClickListener;
    }

    public void setOnItemClickListener(OnNumberClickListener onNumberClickListener) {
        mOnNumberClickListener = onNumberClickListener;
    }

    public OnDeleteClickListener getOnDeleteClickListener() {
        return mOnDeleteClickListener;
    }

    public void setOnDeleteClickListener(OnDeleteClickListener onDeleteClickListener) {
        mOnDeleteClickListener = onDeleteClickListener;
    }

    public CustomizationOptionsBundle getCustomizationOptions() {
        return mCustomizationOptionsBundle;
    }

    public void setCustomizationOptions(CustomizationOptionsBundle customizationOptionsBundle) {
        mCustomizationOptionsBundle = customizationOptionsBundle;
    }

    public class DeleteViewHolder extends RecyclerView.ViewHolder {
        LinearLayout mDeleteButton;
        ImageView mButtonImage;

        public DeleteViewHolder(View itemView) {
            super(itemView);
            int id = Utils.getDynamicID(itemView.getContext(), "id", "button");
            mDeleteButton = (LinearLayout)itemView.findViewById(id);
            id = Utils.getDynamicID(itemView.getContext(), "id", "buttonImage");
            mButtonImage = (ImageView)itemView.findViewById(id);
            if (mCustomizationOptionsBundle.isShowDeleteButton() && mPinLength > 0) {
                mDeleteButton.setOnClickListener(new View.OnClickListener() {
                    public void onClick(View v) {
                        if (mOnDeleteClickListener != null) {
                            mOnDeleteClickListener.onDeleteClicked();
                        }

                    }
                });
                mDeleteButton.setOnLongClickListener(new View.OnLongClickListener() {
                    public boolean onLongClick(View v) {
                        if (mOnDeleteClickListener != null) {
                            mOnDeleteClickListener.onDeleteLongClicked();
                        }

                        return true;
                    }
                });
                /*mDeleteButton.setOnTouchListener(new View.OnTouchListener() {
                    private Rect rect;

                    public boolean onTouch(View v, MotionEvent event) {
                        if (event.getAction() == MotionEvent.ACTION_DOWN) {
                            mButtonImage.setColorFilter(mCustomizationOptionsBundle.getDeleteButtonPressesColor());
                            rect = new Rect(v.getLeft(), v.getTop(), v.getRight(), v.getBottom());
                        }

                        if (event.getAction() == MotionEvent.ACTION_UP) {
                            mButtonImage.clearColorFilter();
                        }

                        if (event.getAction() == MotionEvent.ACTION_MOVE && !rect.contains(v.getLeft() + (int)event.getX(), v.getTop() + (int)event.getY())) {
                            mButtonImage.clearColorFilter();
                        }

                        return false;
                    }
                });*/
            }

        }
    }

    public class NumberViewHolder extends RecyclerView.ViewHolder {
        Button mNumberButton;

        public NumberViewHolder(View itemView) {
            super(itemView);
            int id = Utils.getDynamicID(itemView.getContext(), "id", "button");
            mNumberButton = (Button)itemView.findViewById(id);
            mNumberButton.setOnClickListener(new View.OnClickListener() {
                public void onClick(View v) {
                    if (mOnNumberClickListener != null) {
                        mOnNumberClickListener.onNumberClicked((Integer)v.getTag());
                    }

                }
            });
        }
    }

    public interface OnDeleteClickListener {
        void onDeleteClicked();

        void onDeleteLongClicked();
    }

    public interface OnNumberClickListener {
        void onNumberClicked(int var1);
    }
}