//
//  PatternView.h
//  MOBILE_KOREA_MAIL.iOS
//
//  Created by kang on 2017. 9. 14..
//
//

#import <UIKit/UIKit.h>

@protocol PatternDelegate <NSObject>

- (void)enteredPattern:(NSArray *)pattern;
- (void)completedAnimations;
- (void)startedDrawing;

@end

@interface PatternView : UIView

- (instancetype)initWithDelegate:(id<PatternDelegate>)delegate;
- (void)updateViewForCorrectPatternAnimates:(BOOL)shouldAnimate;
- (void)updateViewForInCorrectPattern;
- (void)updateViewForReEntry;
- (void)invalidateCurrentPattern;

@end
