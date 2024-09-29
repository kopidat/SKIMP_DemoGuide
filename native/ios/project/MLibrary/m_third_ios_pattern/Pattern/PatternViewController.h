//
//  PatternViewController.h
//  MOBILE_KOREA_MAIL.iOS
//
//  Created by kang on 2017. 9. 14..
//
//

#import <UIKit/UIKit.h>

typedef NS_ENUM(NSUInteger, PatternMode) {
    PatternModeValidation,
    PatternModeModify,
};

@protocol PatternViewControllerDelegate <NSObject>

- (void)unlockedPattern;
- (void)modifiedPattern;
- (void)cancelEditing;
- (void)failedPattern;

@end

@interface PatternViewController : UIViewController

- (instancetype)initWithMode:(PatternMode)mode delegate:(id<PatternViewControllerDelegate>)delegate;

@end
