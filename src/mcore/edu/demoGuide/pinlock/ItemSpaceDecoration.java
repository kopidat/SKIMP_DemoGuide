package mcore.edu.demoGuide.pinlock;

import android.graphics.Rect;
import android.view.View;

import androidx.recyclerview.widget.RecyclerView;

public class ItemSpaceDecoration extends RecyclerView.ItemDecoration {
    private final int mHorizontalSpaceWidth;
    private final int mVerticalSpaceHeight;
    private final int mSpanCount;
    private final boolean mIncludeEdge;

    public ItemSpaceDecoration(int horizontalSpaceWidth, int verticalSpaceHeight, int spanCount, boolean includeEdge) {
        this.mHorizontalSpaceWidth = horizontalSpaceWidth;
        this.mVerticalSpaceHeight = verticalSpaceHeight;
        this.mSpanCount = spanCount;
        this.mIncludeEdge = includeEdge;
    }

    public void getItemOffsets(Rect outRect, View view, RecyclerView parent, RecyclerView.State state) {
        int position = parent.getChildAdapterPosition(view);
        int column = position % this.mSpanCount;
        if (this.mIncludeEdge) {
            outRect.left = this.mHorizontalSpaceWidth - column * this.mHorizontalSpaceWidth / this.mSpanCount;
            outRect.right = (column + 1) * this.mHorizontalSpaceWidth / this.mSpanCount;
            if (position < this.mSpanCount) {
                outRect.top = this.mVerticalSpaceHeight;
            }

            outRect.bottom = this.mVerticalSpaceHeight;
        } else {
            outRect.left = column * this.mHorizontalSpaceWidth / this.mSpanCount;
            outRect.right = this.mHorizontalSpaceWidth - (column + 1) * this.mHorizontalSpaceWidth / this.mSpanCount;
            if (position >= this.mSpanCount) {
                outRect.top = this.mVerticalSpaceHeight;
            }
        }

    }
}
