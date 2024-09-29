package mcore.edu.demoGuide.pinlock;

import android.graphics.drawable.Drawable;

public class CustomizationOptionsBundle {
    private int textColor;
    private int textSize;
    private int buttonSize;
    private Drawable buttonBackgroundDrawable;
    private Drawable deleteButtonDrawable;
    private int deleteButtonSize;
    private boolean showDeleteButton;
    private int deleteButtonPressesColor;

    public CustomizationOptionsBundle() {
    }

    public int getTextColor() {
        return this.textColor;
    }

    public void setTextColor(int textColor) {
        this.textColor = textColor;
    }

    public int getTextSize() {
        return this.textSize;
    }

    public void setTextSize(int textSize) {
        this.textSize = textSize;
    }

    public int getButtonSize() {
        return this.buttonSize;
    }

    public void setButtonSize(int buttonSize) {
        this.buttonSize = buttonSize;
    }

    public Drawable getButtonBackgroundDrawable() {
        return this.buttonBackgroundDrawable;
    }

    public void setButtonBackgroundDrawable(Drawable buttonBackgroundDrawable) {
        this.buttonBackgroundDrawable = buttonBackgroundDrawable;
    }

    public Drawable getDeleteButtonDrawable() {
        return this.deleteButtonDrawable;
    }

    public void setDeleteButtonDrawable(Drawable deleteButtonDrawable) {
        this.deleteButtonDrawable = deleteButtonDrawable;
    }

    public int getDeleteButtonSize() {
        return this.deleteButtonSize;
    }

    public void setDeleteButtonSize(int deleteButtonSize) {
        this.deleteButtonSize = deleteButtonSize;
    }

    public boolean isShowDeleteButton() {
        return this.showDeleteButton;
    }

    public void setShowDeleteButton(boolean showDeleteButton) {
        this.showDeleteButton = showDeleteButton;
    }

    public int getDeleteButtonPressesColor() {
        return this.deleteButtonPressesColor;
    }

    public void setDeleteButtonPressesColor(int deleteButtonPressesColor) {
        this.deleteButtonPressesColor = deleteButtonPressesColor;
    }
}
