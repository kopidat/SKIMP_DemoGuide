package mcore.edu.demoGuide.pinlock;

import android.content.Context;

import androidx.recyclerview.widget.GridLayoutManager;

public class LTRGridLayoutManager extends GridLayoutManager {
    public LTRGridLayoutManager(Context context, int spanCount) {
        super(context, spanCount);
    }

    public LTRGridLayoutManager(Context context, int spanCount, int orientation, boolean reverseLayout) {
        super(context, spanCount, orientation, reverseLayout);
    }

    protected boolean isLayoutRTL() {
        return false;
    }
}
