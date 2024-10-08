/*
 * Copyright (c) 2015 Zhang Hai <Dreaming.in.Code.ZH@Gmail.com>
 * All Rights Reserved.
 */

/*
 * From com.android.internal.widget.LockPatternView at 2cb687e7b9d0cbb1af5ba753453a9a05350a100e,
 * adapted by Zhang Hai.
 */

package mcore.edu.demoGuide.patternlock;

/*
 * Copyright (C) 2007 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import android.content.Context;
import android.content.res.TypedArray;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.ColorFilter;
import android.graphics.Matrix;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.PorterDuff;
import android.graphics.PorterDuffColorFilter;
import android.graphics.Rect;
import android.os.Debug;
import android.os.Parcel;
import android.os.Parcelable;
import android.os.SystemClock;
import android.util.AttributeSet;
import android.view.HapticFeedbackConstants;
import android.view.MotionEvent;
import android.view.View;
import android.view.accessibility.AccessibilityManager;

import androidx.core.content.ContextCompat;

import java.util.ArrayList;
import java.util.List;

import m.client.android.library.core.utils.PLog;
import mcore.edu.demoGuide.R;

/**
 * Displays and detects the user's unlock attempt, which is a drag of a finger
 * across 9 regions of the screen.
 *
 * Is also capable of displaying a static pattern in "in progress", "wrong" or
 * "correct" states.
 */
public class PatternView extends View {
	private static final String TAG = PatternView.class.getSimpleName();

	private Context context;
	
	// Aspect to use when rendering this view
	private static final int ASPECT_SQUARE = 0; // View will be the minimum of width/height
	private static final int ASPECT_LOCK_WIDTH = 1; // Fixed width; height will be minimum of (w,h)
	private static final int ASPECT_LOCK_HEIGHT = 2; // Fixed height; width will be minimum of (w,h)
	
	private static final boolean PROFILE_DRAWING = false;
	private final CellState[][] mCellStates;
	private boolean mDrawingProfilingStarted = false;
	
	private Paint mPaint = new Paint();
	private Paint mPathPaint = new Paint();
	
	/**
	 * How many milliseconds we spend animating each circle of a pattern
	 * if the animating mode is set. The entire animation should take this
	 * constant * the length of the pattern to complete.
	 */
	private static final int MILLIS_PER_CIRCLE_ANIMATING = 700;
	
	/**
	 * This can be used to avoid updating the display for very small motions or noisy panels.
	 * It didn't seem to have much impact on the devices tested, so currently set to 0.
	 */
	private static final float DRAG_THRESHHOLD = 0.0f;
	
	private OnPatternListener mOnPatternListener;
	private ArrayList<Cell> mPattern = new ArrayList<>(9);
	
	/**
     * Lookup table for the circles of the pattern we are currently drawing.
     * This will be the cells of the complete pattern unless we are animating,
     * in which case we use this to hold the cells we are drawing for the in
     * progress animation.
     */
	private boolean[][] mPatternDrawLookup = new boolean[3][3];
	
	/**
	 * the in progress point:
	 * - during interaction: where the user's finger is
	 * - during animation: the current tip of the animating line
	 */
	private float mInProgressX = -1;
	private float mInProgressY = -1;
	
	private long mAnimatingPeriodStart;
	
	private DisplayMode mDisplayMode = DisplayMode.Correct;
	private boolean mInputEnabled = true;
	private boolean mInStealthMode = false;
	private boolean mPatternInProgress = false;
	
	private float mDiameterFactor = 0.10f;	// TDOD: move to attrs
	private final int mStrokeAlpha = 128;
	private float mHitFactor = 0.6f;
	
	private float mSquareWidth;
	private float mSquareHeight;
	
//	private final Bitmap mBitmapDotDefault;
//	private final Bitmap mBitmapDotTouched;
	private final Bitmap mBitmapCircleDefault;
	private final Bitmap mBitmapCircleError;
	private final Bitmap mBitmapCircle;
	private final Bitmap mBitmapArrowUp;
	
	private final Path mCurrentPath = new Path();
	private final Rect mInvalidate = new Rect();
	private final Rect mTmpInvalidateRect = new Rect();
	
	private int mBitmapWidth;
	private int mBitmapHeight;
	
	private int mAspect;
	private final Matrix mArrowMatrix = new Matrix();
	private final Matrix mCircleMatrix = new Matrix();
	private final PorterDuffColorFilter mRegularColorFilter;
	private final PorterDuffColorFilter mErrorColorFilter;
	private final PorterDuffColorFilter mSuccessColorFilter;
	
	/**
	 * Represents a cell in the 3 X 3 matrix of the unpattern view.
	 */
	public static class Cell {
		int row;
		int column;
		
		// keep # objects limited to 9
		static Cell[][] sCells = new Cell[3][3];
		static {
			for (int i = 0; i < 3; i++) {
				for (int j = 0; j < 3; j++) {
					sCells[i][j] = new Cell(i, j);
				}
			}
		}
		
		/**
		 * @param row The row of the cell.
		 * @param column The column of the cell.
		 */
		private Cell(int row, int column) {
			checkRange(row, column);
			this.row = row;
			this.column = column;
		}
		
		public int getRow() { return row; }
		
		public int getColumn() { return column; }
		
		/**
		 * @param row The row of the Cell.
		 * @param column The column of the Cell.
		 */
		public static synchronized Cell of(int row, int column) {
			checkRange(row, column);
			return sCells[row][column];
		}
		
		private static void checkRange(int row, int column) {
			if (row < 0 || row > 2) {
				throw new IllegalArgumentException("row must be in range 0-2");
			}
			if (column < 0 || column > 2) {
				throw new IllegalArgumentException("column must be in range 0-2");
			}
		}
		
		public String toString() { return "(row=" + row + ",clmn=" + column + ")"; }
	}
	
	public static class CellState {
		public float scale = 1.0f;
		public float translateY = 0.0f;
		public float alpha = 1.0f;
	}
	
	/**
	 * How to display the current pattern.
	 */
	public enum DisplayMode {
		
		/**
		 * The pattern drawn is correct (i.e draw it in a friendly color)
		 */
		Correct,
		
		/**
		 * Animate the pattern (for demo, and help).
		 */
		Animate,
		
		/**
		 * The pattern is wrong (i.e draw a foreboding color)
		 */
		Wrong
	}
	
	/**
	 * The call back interface for detecting patterns entered by the user.
	 */
	public static interface OnPatternListener {
		
		/**
		 * A new pattern has begun.
		 */
		void onPatternStart();
		
		/**
		 * The pattern was cleared.
		 */
		void onPatternCleared();
		
		/**
		 * The user extended the pattern currently being drawn by one cell.
		 * @param pattern The pattern with newly added cell.
		 */
		void onPatternCellAdded(List<Cell> pattern);
		
		/**
		 * A pattern was detected from the user.
		 * @param pattern The pattern.
		 */
		void onPatternDetected(List<Cell> pattern);
	}
	
	public PatternView(Context context) { this(context, null); }
	
	public PatternView(Context context, AttributeSet attrs) {
		this(context, attrs, R.attr.patternViewStyle);
	}
	
	public PatternView(Context context, AttributeSet attrs, int defStyleAttr) {
		super(context, attrs, defStyleAttr);

		PLog.i(TAG, "PatternView(Context context, AttributeSet attrs, int defStyleAttr)");

		this.context = context;

		setClickable(true);
		
		TypedArray a = context.obtainStyledAttributes(attrs, R.styleable.PatternView, defStyleAttr, 0);
		
		mAspect = a.getInt(R.styleable.PatternView_aspect, ASPECT_SQUARE);
		
		int regularColor = a.getColor(R.styleable.PatternView_regularColor, 0);
		int errorColor = a.getColor(R.styleable.PatternView_errorColor, 0);
		int successColor = a.getColor(R.styleable.PatternView_successColor, 0);
		mRegularColorFilter = new PorterDuffColorFilter(regularColor, PorterDuff.Mode.SRC_ATOP);
		mErrorColorFilter = new PorterDuffColorFilter(errorColor, PorterDuff.Mode.SRC_ATOP);
		mSuccessColorFilter = new PorterDuffColorFilter(successColor, PorterDuff.Mode.SRC_ATOP);
		
		int pathColor = ContextCompat.getColor(context, R.color.pathColor);
		mPathPaint.setAntiAlias(true);
		mPathPaint.setDither(true);
		mPathPaint.setColor(pathColor);
		mPathPaint.setAlpha(mStrokeAlpha);
		mPathPaint.setStyle(Paint.Style.STROKE);
		mPathPaint.setStrokeJoin(Paint.Join.ROUND);
		mPathPaint.setStrokeCap(Paint.Cap.ROUND);

		// lots of bitmap!
//		mBitmapDotDefault = getBitmap(a, R.styleable.PatternView_dotDrawableDefault);
//		mBitmapDotTouched = getBitmap(a, R.styleable.PatternView_dotDrawableTouched);
		mBitmapCircleDefault = getBitmap(a, R.styleable.PatternView_circleDrawableDefault);
		mBitmapCircleError = getBitmap(a, R.styleable.PatternView_circleDrawableError);
		mBitmapCircle = getBitmap(a, R.styleable.PatternView_circleDrawable);
		mBitmapArrowUp = getBitmap(a, R.styleable.PatternView_arrowUpDrawable);
		// bitmaps have the size of the largest bitmap in this group
		final Bitmap bitmaps[] = {mBitmapCircleDefault, mBitmapCircleError, mBitmapCircle};
		for (Bitmap bitmap : bitmaps) {
			mBitmapWidth = Math.max(mBitmapWidth, bitmap.getWidth());
			mBitmapHeight = Math.max(mBitmapHeight, bitmap.getHeight());
		}
		
		a.recycle();
		
		mPaint.setAntiAlias(true);
		mPaint.setDither(true);
		mPaint.setFilterBitmap(true);
		
		mCellStates = new CellState[3][3];
		for (int i = 0; i < 3; i++) {
			for (int j = 0; j < 3; j++) {
				mCellStates[i][j] = new CellState();
			}
		}
	}
	
	public CellState[][] getCellStates() { return mCellStates; }
	
	private Bitmap getBitmap(TypedArray a, int index) {
		return BitmapFactory.decodeResource(getContext().getResources(), a.getResourceId(index, 0));
	}
	
	/**
	 * @return Whether the view is in stealth mode.
	 */
	public boolean isInStealthMode() { return mInStealthMode; }
	
	/**
	 * Set whether the view is in stealth mode. If true, there will be no
	 * visible feedback as the user enters the pattern.
	 * 
	 * @param inStealthMode Whether in stealth mode.
	 */
	public void setInStealthMode(boolean inStealthMode) { mInStealthMode = inStealthMode; }
	
	public boolean behavesInStealthMode() {
		return mInStealthMode && mDisplayMode == DisplayMode.Correct;
	}
	
	/**
	 * Set the call back for pattern detection.
	 * @param onPatternListener The call back.
	 */
	public void setOnPatternListener(
			OnPatternListener onPatternListener) {
		mOnPatternListener = onPatternListener;
	}
	
	/**
	 * Set the pattern explicitely (rather than waiting for the user to input
	 * a pattern).
	 * @param displayMode How to display the pattern.
	 * @param pattern The pattern.
	 */
	public void setPattern(DisplayMode displayMode, List<Cell> pattern) {
		mPattern.clear();
		mPattern.addAll(pattern);
		clearPatternDrawLookup();
		for (Cell cell : pattern) {
			mPatternDrawLookup[cell.getRow()][cell.getColumn()] = true;
		}
		
		setDisplayMode(displayMode);
	}
	
	public DisplayMode getDisplayMode() { return mDisplayMode; }
	
	/**
	 * Set the display mode of the current pattern. This can be useful, for
	 * instance, after detecting a pattern to tell this view whether change the
	 * in progress result to correct or wrong.
	 * @param displayMode The display mode.
	 */
	public void setDisplayMode(DisplayMode displayMode) {
		mDisplayMode = displayMode;
		if (displayMode == DisplayMode.Animate) {
			if (mPattern.size() == 0) {
				throw new IllegalStateException("you must have a pattern to "
						+ "animate if you want to set the display mode to animate");
			}
			mAnimatingPeriodStart = SystemClock.elapsedRealtime();
			final Cell first = mPattern.get(0);
			mInProgressX = getCenterXForColumn(first.getColumn());
			mInProgressY = getCenterYForRow(first.getRow());
			clearPatternDrawLookup();
		}
		invalidate();
	}
	
	private void notifyCellAdded() {
//		announceForAccessibility("Cell added");
		if (mOnPatternListener != null) {
			mOnPatternListener.onPatternCellAdded(mPattern);
		}
	}
	
	private void notifyPatternStarted() {
//		announceForAccessibility("Pattern started");
		if (mOnPatternListener != null) {
			mOnPatternListener.onPatternStart();
		}
	}
	
	private void notifyPatternDetected() {
//		announceForAccessibility("Pattern completed");
		if (mOnPatternListener != null) {
			mOnPatternListener.onPatternDetected(mPattern);
		}
	}
	
	private void notifyPatternCleared() {
//		announceForAccessibility("Pattern cleared");
		if (mOnPatternListener != null) {
			mOnPatternListener.onPatternCleared();
		}
	}
	
	/**
	 * Clear the pattern.
	 */
	public void clearPattern() { resetPattern(); }
	
	/**
	 * Reset all pattern state.
	 */
	private void resetPattern() {
		mPattern.clear();
		clearPatternDrawLookup();
		mDisplayMode = DisplayMode.Correct;
		invalidate();
	}
	
	/**
	 * Clear the pattern lookup table.
	 */
	private void clearPatternDrawLookup() {
		for (int i = 0; i < 3; i++) {
			for (int j = 0; j < 3; j++) {
				mPatternDrawLookup[i][j] = false;
			}
		}
	}
	
	public boolean isInputEnabled() { return mInputEnabled; }
	
	/**
	 * Enable or disable input.
	 * (for instance when displaying a message that will timeout so user doesn't get view into messy
	 * state).
	 */
	public void setInputEnabled(boolean inputEnabled) { mInputEnabled = inputEnabled; }

	@Override
	protected void onSizeChanged(int w, int h, int oldw, int oldh) {
		final int width = w - getPaddingLeft() - getPaddingRight();
		mSquareWidth = width / 3.0f;
		
		final int height = h - getPaddingTop() - getPaddingBottom();
		mSquareHeight = height / 3.0f;
	}
	
	private int resolveMeasured(int measureSpec, int desired)
	{
		int result = 0;
		int specSize = MeasureSpec.getSize(measureSpec);
		switch (MeasureSpec.getMode(measureSpec)) {
			case MeasureSpec.UNSPECIFIED:
				result = desired;
				break;
			case MeasureSpec.AT_MOST:
				result = Math.max(specSize, desired);
				break;
			case MeasureSpec.EXACTLY:
			default:
				result = specSize;
		}
		return result;
	}

	@Override
	protected int getSuggestedMinimumWidth() {
		// View should be large enough to contain 3 side-by-side target bitmaps
		return 3 * mBitmapWidth;
	}
	
	@Override
	protected int getSuggestedMinimumHeight() {
		// View should be large enough to contain 3 side-by-side target bitmaps
		return 3 * mBitmapWidth;
	}

	@Override
	protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
		final int minimumWidth = getSuggestedMinimumWidth();
		final int minimumHeight = getSuggestedMinimumHeight();
		int viewWidth = resolveMeasured(widthMeasureSpec, minimumWidth);
		int viewHeight = resolveMeasured(heightMeasureSpec, minimumHeight);
		
		switch (mAspect) {
			case ASPECT_SQUARE:
				viewWidth = viewHeight = Math.min(viewWidth, viewHeight);
				break;
			case ASPECT_LOCK_WIDTH:
				viewHeight = Math.min(viewWidth, viewHeight);
				break;
			case ASPECT_LOCK_HEIGHT:
				viewWidth = Math.min(viewWidth, viewHeight);
				break;
		}
		setMeasuredDimension(viewWidth, viewHeight);
	}
	
	/**
	 * Determines whether the point x, y will add a new point to the current
	 * pattern (in addition to finding the cell, also makes heuristic choices
	 * such as filling in gaps based on current pattern).
	 * @param x The x coordinate.
	 * @param y The y coordinate.
	 */
	private Cell detectAndAddHit(float x, float y) {
		final Cell cell = checkForNewHit(x, y);
		if (cell != null) {
			
			// check for gaps in existing pattern
			Cell fillInGapCell = null;
			final ArrayList<Cell> pattern = mPattern;
			if (!pattern.isEmpty()) {
				final Cell lastCell = pattern.get(pattern.size() - 1);
				int dRow = cell.row - lastCell.row;
				int dColumn = cell.column - lastCell.column;
				
				int fillInRow = lastCell.row;
				int fillInColumn = lastCell.column;
				
				if (Math.abs(dRow) == 2 && Math.abs(dColumn) != 1) {
					fillInRow = lastCell.row + ((dRow > 0) ? 1 : -1);
				}
				
				if (Math.abs(dColumn) == 2 && Math.abs(dRow) != 1) {
					fillInColumn = lastCell.column + ((dColumn > 0) ? 1 : -1);
				}
				
				fillInGapCell = Cell.of(fillInRow, fillInColumn);
			}
			
			if (fillInGapCell != null && !mPatternDrawLookup[fillInGapCell.row][fillInGapCell.column]) {
				addCellToPattern(fillInGapCell);
			}
			addCellToPattern(cell);
			performHapticFeedback(HapticFeedbackConstants.VIRTUAL_KEY);
			return cell;
		}
		return null;
	}
	
	private void addCellToPattern(Cell newCell) {
		mPatternDrawLookup[newCell.getRow()][newCell.getColumn()] = true;
		mPattern.add(newCell);
		notifyCellAdded();
	}
	
	// helper method to find which cell a point maps to
	private Cell checkForNewHit(float x, float y) {
		
		final int rowHit = getRowHit(y);
		if (rowHit < 0) {
			return null;
		}
		final int columnHit = getColumnHit(x);
		if (columnHit < 0) {
			return null;
		}
		
		if (mPatternDrawLookup[rowHit][columnHit]) {
			return null;
		}
		return Cell.of(rowHit, columnHit);
	}
	
	/**
	 * Helper method to find the row that y falls into.
	 * @param y The y coordinate
	 * @return The row that y falls in, or -1 if it falls in no row.
	 */
	private int getRowHit(float y) {
		
		final float squareHeight = mSquareHeight;
		float hitSize = squareHeight * mHitFactor;
		
		float offset = getPaddingTop() + (squareHeight - hitSize) / 2f;
		for (int i = 0; i < 3; i++) {
			
			final float hitTop = offset + squareHeight * i;
			if (y >= hitTop && y <= hitTop + hitSize) {
				return i;
			}
		}
		return -1;
	}
	
	/**
	 * Helper method to find the column x fallis into.
	 * @param x The x coordinate.
	 * @return The column that x falls in, or -1 if it falls in no column.
	 */
	private int getColumnHit(float x) {
		final float squareWidth = mSquareWidth;
		float hitSize = squareWidth * mHitFactor;
		
		float offset = getPaddingLeft() + (squareWidth - hitSize) / 2f;
		for (int i = 0; i < 3; i++) {
			
			final float hitLeft = offset + squareWidth * i;
			if (x >= hitLeft && x <= hitLeft + hitSize) {
				return i;
			}
		}
		return -1;
	}

	@Override
	public boolean onHoverEvent(MotionEvent event) {
		if (((AccessibilityManager)getContext().getSystemService(Context.ACCESSIBILITY_SERVICE))
				.isTouchExplorationEnabled()) {
			final int action = event.getAction();
			switch (action) {
				case MotionEvent.ACTION_HOVER_ENTER:
					event.setAction(MotionEvent.ACTION_DOWN);
					break;
				case MotionEvent.ACTION_HOVER_MOVE:
					event.setAction(MotionEvent.ACTION_MOVE);
					break;
				case MotionEvent.ACTION_HOVER_EXIT:
					event.setAction(MotionEvent.ACTION_UP);
					break;
			}
			onTouchEvent(event);
			event.setAction(action);
		}
		return super.onHoverEvent(event);
	}

	@Override
	public boolean onTouchEvent(MotionEvent event) {
		if (!mInputEnabled || !isEnabled()) {
			return false;
		}
		
		switch(event.getAction()) {
			case MotionEvent.ACTION_DOWN:
				handleActionDown(event);
				return true;
			case MotionEvent.ACTION_UP:
				handleActionUp(event);
				break;
			case MotionEvent.ACTION_MOVE:
				handleActionMove(event);
				break;
			case MotionEvent.ACTION_CANCEL:
				if (mPatternInProgress) {
					mPatternInProgress = false;
					resetPattern();
					notifyPatternCleared();
				}
				if (PROFILE_DRAWING) {
					if (mDrawingProfilingStarted) {
						Debug.stopMethodTracing();
						mDrawingProfilingStarted = false;
					}
				}
				return true;
		}
		return false;
	}

	private void handleActionMove(MotionEvent event) {
		// Handle all recent motion events so we don't skip any cells even when the device
		// is busy...
		final float radius = (mSquareWidth * mDiameterFactor * 0.5f);
		final int historySize = event.getHistorySize();
		mTmpInvalidateRect.setEmpty();
		boolean invalidateNow = false;
		for (int i = 0; i < historySize + 1; i++) {
			final float x = i < historySize ? event.getHistoricalX(i) : event.getX();
			final float y = i < historySize ? event.getHistoricalY(i) : event.getY();
			Cell hitCell = detectAndAddHit(x, y);
			final int patternSize = mPattern.size();
			if (hitCell != null && patternSize == 1) {
				mPatternInProgress = true;
				notifyPatternStarted();
			}
			// note current x and y for rubber banding of in progress patterns
			final float dx = Math.abs(x - mInProgressX);
			final float dy = Math.abs(y - mInProgressY);
			if (dx > DRAG_THRESHHOLD || dy > DRAG_THRESHHOLD) {
				invalidateNow = true;
			}
			
			if (mPatternInProgress && patternSize > 0) {
				final ArrayList<Cell> pattern = mPattern;
				final Cell lastCell = pattern.get(patternSize - 1);
				float lastCellCenterX = getCenterXForColumn(lastCell.column);
				float lastCellCenterY = getCenterYForRow(lastCell.column);
				
				// Adjust for drawn segment from last cell to (x, y). Radius accounts for line width.
				float left = Math.min(lastCellCenterX, x) - radius;
				float right = Math.max(lastCellCenterX, x) + radius;
				float top = Math.min(lastCellCenterY, y) - radius;
				float bottom = Math.max(lastCellCenterY, y) + radius;
				
				// Invalidate between the pattern's new cell and the pattern's previous cell
				if (hitCell != null) {
					final float width = mSquareWidth * 0.5f;
					final float height = mSquareHeight * 0.5f;
					final float hitCellCenterX = getCenterXForColumn(hitCell.column);
					final float hitCellCenterY = getCenterYForRow(hitCell.row);
					
					left = Math.min(hitCellCenterX - width, left);
					right = Math.max(hitCellCenterX + width, right);
					top = Math.min(hitCellCenterY - height, top);
					bottom = Math.max(hitCellCenterY + height, bottom);
				}
				
				// Invalidate between the pattern's last cell and the previous location
				mTmpInvalidateRect.union(Math.round(left), Math.round(top),
						Math.round(right), Math.round(bottom));
			}
		}
		mInProgressX = event.getX();
		mInProgressY = event.getY();
		
		// To save updates, we only invalidate if the user moved beyond a certain amount.
		if (invalidateNow) {
			mInvalidate.union(mTmpInvalidateRect);
			invalidate(mInvalidate);
			mInvalidate.set(mTmpInvalidateRect);
		}
	}
	
	private void announceForAccessibility(int resId) {
		ViewAccessibilityCompat.announceForAccessibility(this, getContext().getString(resId));
	}
	
	private void handleActionUp(MotionEvent event) {
		// report pattern detected
		if (!mPattern.isEmpty()) {
			mPatternInProgress = false;
			notifyPatternDetected();
			invalidate();
		}
		if (PROFILE_DRAWING) {
			if (mDrawingProfilingStarted) {
				Debug.stopMethodTracing();
				mDrawingProfilingStarted = false;
			}
		}
	}
	
	private void handleActionDown(MotionEvent event) {
		resetPattern();
		final float x = event.getX();
		final float y = event.getY();
		final Cell hitCell = detectAndAddHit(x, y);
		if (hitCell != null) {
			mPatternInProgress = true;
			mDisplayMode = DisplayMode.Correct;
			notifyPatternStarted();
		} else if (mPatternInProgress) {
			mPatternInProgress = false;
			notifyPatternCleared();
		}
		if (hitCell != null) {
			final float startX = getCenterXForColumn(hitCell.column);
			final float startY = getCenterYForRow(hitCell.row);
			
			final float widthOffset = mSquareWidth / 2f;
			final float heightOffset = mSquareHeight / 2f;
			
			invalidate((int) (startX - widthOffset), (int) (startY - heightOffset),
					(int) (startX + widthOffset), (int) (startY + heightOffset));
		}
		mInProgressX = x;
		mInProgressY = y;
		if (PROFILE_DRAWING) {
			if (!mDrawingProfilingStarted) {
				Debug.startMethodTracing("PatternDrawing");
				mDrawingProfilingStarted = true;
			}
		}
	}
	
	private float getCenterXForColumn(int column) {
		return getPaddingLeft() + column * mSquareWidth + mSquareWidth / 2f;
	}
	
	private float getCenterYForRow(int row) {
		return getPaddingTop() + row * mSquareHeight + mSquareHeight / 2f;
	}

	@Override
	protected void onDraw(Canvas canvas) {
		mPathPaint.setColor(ContextCompat.getColor(context, R.color.pathColor));

		final ArrayList<Cell> pattern = mPattern;
		final int count = pattern.size();
		final boolean[][] drawLookup = mPatternDrawLookup;
		
		if (mDisplayMode == DisplayMode.Animate) {
			
			// figure out which circles to draw
			
			// + 1 so we pause on complete pattern
			final int oneCycle = (count + 1) * MILLIS_PER_CIRCLE_ANIMATING;
			final int spotInCycle = (int) (SystemClock.elapsedRealtime() -
					mAnimatingPeriodStart) % oneCycle;
			final int numCircles = spotInCycle / MILLIS_PER_CIRCLE_ANIMATING;
			
			clearPatternDrawLookup();
			for (int i = 0; i < numCircles; i++) {
				final Cell cell = pattern.get(i);
				drawLookup[cell.getRow()][cell.getColumn()] = true;
			}
			
			// figure out in progress portion of ghosting line
			
			final boolean needToUpdateInProgressPoint = numCircles > 0
					&& numCircles < count;
			
			if (needToUpdateInProgressPoint) {
				final float percentageOfNextCircle =
						((float) (spotInCycle % MILLIS_PER_CIRCLE_ANIMATING)) /
								MILLIS_PER_CIRCLE_ANIMATING;
				
				final Cell currentCell = pattern.get(numCircles - 1);
				final float centerX = getCenterXForColumn(currentCell.column);
				final float centerY = getCenterYForRow(currentCell.row);
				
				final Cell nextCell = pattern.get(numCircles);
				final float dx = percentageOfNextCircle *
						(getCenterXForColumn(nextCell.column) - centerX);
				final float dy = percentageOfNextCircle *
						(getCenterYForRow(nextCell.row) - centerY);
				mInProgressX = centerX + dx;
				mInProgressY = centerY + dy;
			}
			// TODO: Infinite loop here...
			invalidate();
		}
		
		final float squareWidth = mSquareWidth;
		final float squareHeight = mSquareHeight;
		
		float radius = (squareWidth * mDiameterFactor * 0.5f);
		mPathPaint.setStrokeWidth(radius);
		
		final Path currentPath = mCurrentPath;
		currentPath.rewind();
		
		// draw the circles
		final int paddingTop = getPaddingTop();
		final int paddingLeft = getPaddingLeft();
		
		for (int i = 0; i < 3; i++) {
			float topY = paddingTop + i * squareHeight;
			// float centerY = getPaddingTop() + i * mSquareHeight + (mSquareHeight / 2);
			for (int j = 0; j < 3; j++) {
				float leftX = paddingLeft + j * squareWidth;
				float scale = mCellStates[i][j].scale;
				mPaint.setAlpha((int) (mCellStates[i][j].alpha * 255));
				float translationY = mCellStates[i][j].translateY;
				drawCircle(canvas, (int) leftX, (int) topY + translationY, scale, drawLookup[i][j]);
			}
		}
		
		// Reset the alpha to draw normally
		mPaint.setAlpha(255);
		
		// TODO: the path should be created and cached every time we hit-detect a cell
		// only the last segment of the path should be computed here
		// draw the path of the pattern (unless we are in stealth mode)
		final boolean drawPath = !behavesInStealthMode();
		
		// draw the arrows associated with the path (unless we are in stealth mode)
		if (drawPath) {
			for (int i = 0; i < count - 1; i++) {
				Cell cell = pattern.get(i);
				Cell next = pattern.get(i + 1);
				
				// only draw the part of the pattern stored in
				// the lookup table (this is only different in the case
				// of animation).
				if (!drawLookup[next.row][next.column]) {
					break;
				}
				
				float leftX = paddingLeft + cell.column * squareWidth;
				float topY = paddingTop + cell.row * squareHeight
						+ mCellStates[cell.row][cell.column].translateY;
				
				drawArrow(canvas, leftX, topY, cell, next);
			}
		}
		
		if (drawPath) {
			boolean anyCircles = false;
			for (int i = 0; i < count; i++) {
				Cell cell = pattern.get(i);
				
				// only draw the part of the pattern stored in
				// the lookup table (this is only different in the case
				// of animation).
				if (!drawLookup[cell.row][cell.column]) {
					break;
				}
				anyCircles = true;
				
				float centerX = getCenterXForColumn(cell.column);
				float centerY = getCenterYForRow(cell.row);
				
				// Respect translation in animation
				centerY += mCellStates[cell.row][cell.column].translateY;
				if (i == 0) {
					currentPath.moveTo(centerX, centerY);
				} else {
					currentPath.lineTo(centerX, centerY);
				}
			}
			
			// add last in progress section
			if ((mPatternInProgress || mDisplayMode == DisplayMode.Animate)
					&& anyCircles) {
				currentPath.lineTo(mInProgressX, mInProgressY);
			}
			canvas.drawPath(currentPath, mPathPaint);
		}
	}
	
	private void drawArrow(Canvas canvas, float leftX, float topY, Cell start, Cell end) {
//		if (mPatternInProgress) {
//			mPaint.setColorFilter(mRegularColorFilter);
//		} else {
//			boolean success = mDisplayMode != DisplayMode.Wrong;
//			mPaint.setColorFilter(success ? mSuccessColorFilter : mErrorColorFilter);
//		}
		
		final int endRow = end.row;
		final int startRow = start.row;
		final int endColumn = end.column;
		final int startColumn = start.column;
		
		// offsets for centering the bitmap in the cell
		final int offsetX = ((int) mSquareWidth - mBitmapWidth) / 2;
		final int offsetY = ((int) mSquareHeight - mBitmapHeight) / 2;
		
		// compute transform to place arrow bitmaps at correct angle inside circle.
		// This assumes that the arrow image is drawn at 12:00 with it's top edge
		// coincident with the circle bitmap's top edge.
		final int cellWidth = mBitmapWidth;
		final int cellHeight = mBitmapHeight;
		
		// the up arrow bitmap is at 12:00, so find the rotation from x axis and add 90 degrees.
		final float theta = (float) Math.atan2(
				(double) (endRow - startRow), (double) (endColumn - startColumn));
		final float angle = (float) Math.toDegrees(theta) + 90.0f;
		
		// compose matrix
		float sx = Math.min(mSquareWidth / mBitmapWidth, 1.0f);
		float sy = Math.min(mSquareHeight / mBitmapHeight, 1.0f);
		mArrowMatrix.setTranslate(leftX + offsetX, topY + offsetY);	// transform to cell position
		mArrowMatrix.preTranslate(mBitmapWidth / 2, mBitmapHeight / 2);
		mArrowMatrix.preScale(sx, sy);
		mArrowMatrix.preTranslate(-mBitmapWidth / 2, -mBitmapHeight / 2);
		mArrowMatrix.preRotate(angle, cellWidth / 2.0f, cellHeight / 2.0f);	// rotate about cell center
		mArrowMatrix.preTranslate((cellWidth - mBitmapArrowUp.getWidth()) / 2.0f, 0.0f);	// translate to 12:00 pos
		canvas.drawBitmap(mBitmapArrowUp, mArrowMatrix, mPaint);
	}
	
	/**
	 * @param canvas
	 * @param leftX
	 * @param topY
	 * @param partOfPattern Whether this circle is part of the pattern.
	 */
	private void drawCircle(Canvas canvas, float leftX, float topY, float scale,
                            boolean partOfPattern) {
		Bitmap outerCircle;
		Bitmap innerCircle;
		ColorFilter outerFilter;
		if (!partOfPattern || behavesInStealthMode()) {
			// unselected circle
			outerCircle = mBitmapCircleDefault;
//			innerCircle = mBitmapDotDefault;
			outerFilter = mRegularColorFilter;
		} else if (mPatternInProgress) {
			// user is in middle of drawing a pattern
			outerCircle = mBitmapCircle;
//			innerCircle = mBitmapDotTouched;
			outerFilter = mRegularColorFilter;
		} else if (mDisplayMode == DisplayMode.Wrong) {
			// the pattern is wrong
//			outerCircle = mBitmapCircle;
			outerCircle = mBitmapCircleError;
//			innerCircle = mBitmapDotDefault;
			outerFilter = mErrorColorFilter;
			mPathPaint.setColor(ContextCompat.getColor(context, R.color.erroPathColor));
		} else if (mDisplayMode == DisplayMode.Correct ||
				mDisplayMode == DisplayMode.Animate) {
			// the pattern is correct
			outerCircle = mBitmapCircle;
//			innerCircle = mBitmapDotDefault;
			outerFilter = mSuccessColorFilter;
		} else {
			throw new IllegalStateException("unknown display mode " + mDisplayMode);
		}
		
		final int width = mBitmapWidth;
		final int height = mBitmapHeight;
		
		final float squareWidth = mSquareWidth;
		final float squareHeight = mSquareHeight;
		
		int offsetX = (int) ((squareWidth - width) / 2f);
		int offsetY = (int) ((squareHeight - height) / 2f);
		
		// Allow circles to shrink if the view is too small to hold them.
		float sx = Math.min(mSquareWidth / mBitmapWidth, 1.0f);
		float sy = Math.min(mSquareHeight / mBitmapHeight, 1.0f);
		
		mCircleMatrix.setTranslate(leftX + offsetX, topY + offsetY);
		mCircleMatrix.preTranslate(mBitmapWidth / 2, mBitmapHeight / 2);
		mCircleMatrix.preScale(sx * scale, sy * scale);
		mCircleMatrix.preTranslate(-mBitmapWidth / 2, -mBitmapHeight / 2);
		
//		mPaint.setColorFilter(outerFilter);
		canvas.drawBitmap(outerCircle, mCircleMatrix, mPaint);
//		mPaint.setColorFilter(mRegularColorFilter);
//		canvas.drawBitmap(innerCircle, mCircleMatrix, mPaint);
	}

	@Override
	protected Parcelable onSaveInstanceState() {
		Parcelable superState = super.onSaveInstanceState();
		return new SavedState(superState,
				PatternUtils.patternToString(mPattern),
				mDisplayMode.ordinal(),
				mInputEnabled, mInStealthMode);
	}

	@Override
	protected void onRestoreInstanceState(Parcelable state) {
		final SavedState ss = (SavedState) state;
		super.onRestoreInstanceState(ss.getSuperState());
		setPattern(
				DisplayMode.Correct,
				PatternUtils.stringToPattern(ss.getSerializedPattern()));
		mDisplayMode = DisplayMode.values()[ss.getDisplayMode()];
		mInputEnabled = ss.isInputEnabled();
		mInStealthMode = ss.isInStealthMode();
	}
	
	/**
	 * The parecelable for saving and restoring a pattern view.
	 */
	private static class SavedState extends BaseSavedState {
		
		private final String mSerializedPattern;
		private final int mDisplayMode;
		private final boolean mInputEnabled;
		private final boolean mInStealthMode;
		
		/**
		 * Constructor called from {@link PatternView#onSaveInstanceState()}
		 */
		private SavedState(Parcelable superState, String serializedPattern, int displayMode,
                           boolean inputEnabled, boolean inStealthMode) {
			super(superState);
			mSerializedPattern = serializedPattern;
			mDisplayMode = displayMode;
			mInputEnabled = inputEnabled;
			mInStealthMode = inStealthMode;
		}
		
		/**
		 * Constructor called from {@link #CREATOR}
		 */
		private SavedState(Parcel in) {
			super(in);
			mSerializedPattern = in.readString();
			mDisplayMode = in.readInt();
			mInputEnabled = (Boolean) in.readValue(null);
			mInStealthMode = (Boolean) in.readValue(null);
		}
		
		public String getSerializedPattern() { return mSerializedPattern; }
		
		public int getDisplayMode() { return mDisplayMode; }
		
		public boolean isInputEnabled() { return mInputEnabled; }
		
		public boolean isInStealthMode() { return mInStealthMode; }

		@Override
		public void writeToParcel(Parcel dest, int flags) {
			super.writeToParcel(dest, flags);
			dest.writeString(mSerializedPattern);
			dest.writeInt(mDisplayMode);
			dest.writeValue(mInputEnabled);
			dest.writeValue(mInStealthMode);
		}
		
		public static final Creator<SavedState> CREATOR =
				new Creator<SavedState>() {
					public SavedState createFromParcel(Parcel in) { return new SavedState(in); }
					
					public SavedState[] newArray(int size) { return new SavedState[size]; }
				};
	}
}
