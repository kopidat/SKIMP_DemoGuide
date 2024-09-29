//
//  PatternViewController.m
//  MOBILE_KOREA_MAIL.iOS
//
//  Created by kang on 2017. 9. 14..
//
//

#import "PatternViewController.h"
#import "PatternView.h"
#import "PatternManager.h"
#import <MThirdPartyPattern/MThirdPartyPatternPlugin.h>

typedef NS_ENUM(NSUInteger, PatternState) {
    PatternStateValidation,
    PatternStateEntry,
    PatternStateReEntry
};

@interface PatternViewController () <PatternDelegate>

@property (nonatomic, strong) PatternView *patternView;
@property (nonatomic) PatternMode patternMode;
@property (nonatomic) PatternState patternState;
@property (nonatomic, strong) NSArray *tempPattern;
@property (nonatomic, weak) id<PatternViewControllerDelegate> delegate;
@property (nonatomic, strong) UIButton *cancelButton;
@property (nonatomic, strong) UIButton *confirmButton;
@property (nonatomic, strong) UIButton *resetButton;
@property (nonatomic, strong) UIButton *continueButton;
@property (nonatomic, strong) UILabel *infoLabel;
@property (nonatomic, strong) UIImageView *titleBackgroundImg;
@property (nonatomic, strong) UIView *titleBackgroundView;
@property (nonatomic, strong) UILabel *titleLabel;
@property (nonatomic, strong) UIImageView *patternStepImg;
@property (nonatomic, strong) UIButton *backButton;
@property (nonatomic, strong) UIButton *closeButton;

@property (nonatomic, assign) NSInteger patternFailCount;

@end

@implementation PatternViewController

- (instancetype)initWithMode:(PatternMode)mode delegate:(id<PatternViewControllerDelegate>)delegate {
    if (self = [super init]) {
        _patternMode = mode;
        _patternState = PatternStateValidation;
        _delegate = delegate;
    }
    return self;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    [self.view setBackgroundColor:[UIColor whiteColor]];
    [self addSubViews];
    [self setLayoutConstraints];
    [self addTitleView];
    [self addInfoView];
    
    _patternFailCount = 0;
    
    if (self.patternMode == PatternModeModify) {
        self.patternState = PatternStateEntry;
        self.titleLabel.text = @"패턴 설정";
        //  상단의 스텝 이미지 제거 : 컨펌 시 이하 로직 제거 필요
//        [self addPatternStepView];
    }
}

- (void)addSubViews {
    [self.view addSubview:self.patternView];
}

- (void)setLayoutConstraints {
    
    NSDictionary *views = @{@"patternView":self.patternView};
    NSDictionary *metrics = @{@"padding":@10};
    NSDictionary *vmetrics = @{@"vPadding":@250};
    [self.view addConstraints:[NSLayoutConstraint constraintsWithVisualFormat:@"|-(padding)-[patternView]-(padding)-|"
                                                                      options:kNilOptions
                                                                      metrics:metrics
                                                                        views:views]];
    [self.view addConstraint:[NSLayoutConstraint constraintWithItem:self.patternView
                                                          attribute:NSLayoutAttributeWidth
                                                          relatedBy:NSLayoutRelationEqual
                                                             toItem:self.patternView
                                                          attribute:NSLayoutAttributeHeight
                                                         multiplier:1
                                                           constant:0]];
    [self.view addConstraints:[NSLayoutConstraint constraintsWithVisualFormat:@"V:|-(vPadding)-[patternView]"
                                                                      options:kNilOptions
                                                                      metrics:vmetrics
                                                                        views:views]];
}

- (void)addTitleView {
//    [self.view addSubview:self.titleBackgroundImg];
    [self.view addSubview:self.titleBackgroundView];
    [self.view addSubview:self.titleLabel];
    [self.view addSubview:self.backButton];
    
    if (self.patternMode == PatternModeValidation) {
        [self.backButton setHidden:YES];
    } else {
        [self.backButton setHidden:NO];
    }
    
    NSDictionary *views = @{@"titleBackgroundView":self.titleBackgroundView, @"titleLabel":self.titleLabel, @"backButton":self.backButton};
    NSDictionary *metrics = @{@"padding":@20, @"labelPadding":@35, @"buttonVPadding":@25, @"buttonHPadding":@10};
    
    [self.view addConstraints:[NSLayoutConstraint constraintsWithVisualFormat:@"V:|-(padding)-[titleBackgroundView]"
                                                                     options:kNilOptions
                                                                     metrics:metrics
                                                                       views:views]];
    [self.view addConstraints:[NSLayoutConstraint constraintsWithVisualFormat:@"|[titleBackgroundView]|"
                                                                      options:kNilOptions
                                                                      metrics:metrics
                                                                        views:views]];
    [self.view addConstraints:[NSLayoutConstraint constraintsWithVisualFormat:@"V:|-(labelPadding)-[titleLabel]"
                                                                      options:kNilOptions
                                                                      metrics:metrics
                                                                        views:views]];
    [self.view addConstraints:[NSLayoutConstraint constraintsWithVisualFormat:@"|[titleLabel]|"
                                                                      options:kNilOptions
                                                                      metrics:nil
                                                                        views:views]];
    [self.view addConstraints:[NSLayoutConstraint constraintsWithVisualFormat:@"V:|-(buttonVPadding)-[backButton]"
                                                                      options:kNilOptions
                                                                      metrics:metrics
                                                                        views:views]];
    [self.view addConstraints:[NSLayoutConstraint constraintsWithVisualFormat:@"H:|-(buttonHPadding)-[backButton]"
                                                                      options:kNilOptions
                                                                      metrics:metrics
                                                                        views:views]];
}

- (void)addPatternStepView {
    [self.view addSubview:self.patternStepImg];
    NSDictionary *views = @{@"patternStepImg":self.patternStepImg};
    NSDictionary *metrics = @{@"padding":@120};
    [self.view addConstraints:[NSLayoutConstraint constraintsWithVisualFormat:@"V:|-(padding)-[patternStepImg]"
                                                                      options:kNilOptions
                                                                      metrics:metrics
                                                                        views:views]];
    [self.view addConstraint:[NSLayoutConstraint constraintWithItem:self.patternStepImg
                                                          attribute:NSLayoutAttributeCenterX
                                                          relatedBy:NSLayoutRelationEqual
                                                             toItem:self.view
                                                          attribute:NSLayoutAttributeCenterX
                                                         multiplier:1
                                                           constant:0]];
}

- (void)addInfoView {
    [self.view addSubview:self.infoLabel];
    NSNumber *paddingNum;
    
    if (self.patternMode == PatternModeValidation) {
        paddingNum = @150;
    } else {
        paddingNum = @200;
    }
    
    NSDictionary *views = @{@"label":self.infoLabel};
    NSDictionary *metrics = @{@"padding":paddingNum};
    [self.view addConstraints:[NSLayoutConstraint constraintsWithVisualFormat:@"V:|-(padding)-[label]"
                                                                      options:kNilOptions
                                                                      metrics:metrics
                                                                        views:views]];
    [self.view addConstraints:[NSLayoutConstraint constraintsWithVisualFormat:@"|[label]|"
                                                                      options:kNilOptions
                                                                      metrics:metrics
                                                                        views:views]];
}

- (void)modifyUIForEntryState {
    
    [self.view addSubview:self.resetButton];
    [self.view addSubview:self.continueButton];
    
    NSDictionary *views = @{@"reset":self.resetButton, @"continue":self.continueButton};
    NSDictionary *metrics = @{@"padding":@1, @"height":@50};
    [self.view addConstraints:[NSLayoutConstraint constraintsWithVisualFormat:@"|[reset]-(padding)-[continue(==reset)]|"
                                                                      options:kNilOptions
                                                                      metrics:metrics
                                                                        views:views]];
    [self.view addConstraints:[NSLayoutConstraint constraintsWithVisualFormat:@"V:[reset]-|"
                                                                      options:kNilOptions
                                                                      metrics:metrics
                                                                        views:views]];
    [self.view addConstraints:[NSLayoutConstraint constraintsWithVisualFormat:@"V:[continue]-|"
                                                                      options:kNilOptions
                                                                      metrics:metrics
                                                                        views:views]];
    [self.view addConstraints:[NSLayoutConstraint constraintsWithVisualFormat:@"V:[reset(height)]"
                                                                      options:kNilOptions
                                                                      metrics:metrics
                                                                        views:views]];
    [self.view addConstraints:[NSLayoutConstraint constraintsWithVisualFormat:@"V:[continue(height)]"
                                                                      options:kNilOptions
                                                                      metrics:metrics
                                                                        views:views]];
}

- (void)modifyUIForReEntryState {
    
    [self.resetButton removeFromSuperview];
    [self.continueButton removeFromSuperview];
    
    [self.view addSubview:self.cancelButton];
    [self.view addSubview:self.confirmButton];
    
    NSDictionary *views = @{@"cancel":self.cancelButton, @"confirm":self.confirmButton};
    NSDictionary *metrics = @{@"padding":@1, @"height":@50};
    [self.view addConstraints:[NSLayoutConstraint constraintsWithVisualFormat:@"|[cancel]-(padding)-[confirm(==cancel)]|"
                                                                      options:kNilOptions
                                                                      metrics:metrics
                                                                        views:views]];
    [self.view addConstraints:[NSLayoutConstraint constraintsWithVisualFormat:@"V:[cancel]-|"
                                                                      options:kNilOptions
                                                                      metrics:metrics
                                                                        views:views]];
    [self.view addConstraints:[NSLayoutConstraint constraintsWithVisualFormat:@"V:[confirm]-|"
                                                                      options:kNilOptions
                                                                      metrics:metrics
                                                                        views:views]];
    [self.view addConstraints:[NSLayoutConstraint constraintsWithVisualFormat:@"V:[confirm(height)]"
                                                                      options:kNilOptions
                                                                      metrics:metrics
                                                                        views:views]];
    [self.view addConstraints:[NSLayoutConstraint constraintsWithVisualFormat:@"V:[cancel(height)]"
                                                                      options:kNilOptions
                                                                      metrics:metrics
                                                                        views:views]];
}

#pragma mark getters
- (PatternView *)patternView {
    if (!_patternView) {
        _patternView = [[PatternView alloc] initWithDelegate:self];
    }
    return _patternView;
}

- (void)setPatternState:(PatternState)patternState {
    _patternState = patternState;
    if (patternState == PatternStateEntry) {
        [self modifyUIForEntryState];
        self.infoLabel.text = @"패턴을 설정해 주세요.";
    } else if (patternState == PatternStateReEntry) {
        [self modifyUIForReEntryState];
        self.infoLabel.text = @"확인을 위해 패턴을 다시 한 번 그리세요.";
    }
}

- (UIButton *)cancelButton {
    if (!_cancelButton) {
        _cancelButton = [[UIButton alloc] init];
        [_cancelButton setTranslatesAutoresizingMaskIntoConstraints:NO];
        [_cancelButton setTitleColor:[UIColor whiteColor] forState:UIControlStateNormal];
        [_cancelButton setTitleColor:[UIColor grayColor] forState:UIControlStateDisabled];
        [_cancelButton setTitle:@"취소" forState:UIControlStateNormal];
        [_cancelButton setBackgroundColor:[UIColor colorWithRed:0.75 green:0.75 blue:0.75 alpha:1.0]];
        [_cancelButton addTarget:self action:@selector(cancelModification:) forControlEvents:UIControlEventTouchUpInside];
    }
    return _cancelButton;
}

- (UIButton *)confirmButton {
    if (!_confirmButton) {
        _confirmButton = [[UIButton alloc] init];
        [_confirmButton setTranslatesAutoresizingMaskIntoConstraints:NO];
        [_confirmButton setTitle:@"확인" forState:UIControlStateNormal];
        [_confirmButton setTitleColor:[UIColor whiteColor] forState:UIControlStateNormal];
        [_confirmButton setTitleColor:[UIColor grayColor] forState:UIControlStateDisabled];
        [_confirmButton setBackgroundColor:[UIColor colorWithRed:0.75 green:0.75 blue:0.75 alpha:1.0]];
        [_confirmButton addTarget:self action:@selector(confirmPattern:) forControlEvents:UIControlEventTouchUpInside];
        [_confirmButton setEnabled:NO];
    }
    return _confirmButton;
}

- (UIButton *)resetButton {
    if (!_resetButton) {
        _resetButton = [[UIButton alloc] init];
        [_resetButton setTranslatesAutoresizingMaskIntoConstraints:NO];
        [_resetButton setTitleColor:[UIColor whiteColor] forState:UIControlStateNormal];
        [_resetButton setTitleColor:[UIColor grayColor] forState:UIControlStateDisabled];
        [_resetButton setTitle:@"다시 시도" forState:UIControlStateNormal];
        [_resetButton setBackgroundColor:[UIColor colorWithRed:0.75 green:0.75 blue:0.75 alpha:1.0]];
        [_resetButton addTarget:self action:@selector(resetPattern:) forControlEvents:UIControlEventTouchUpInside];
        [_resetButton setEnabled:NO];
    }
    return _resetButton;
}

- (UIButton *)continueButton {
    if (!_continueButton) {
        _continueButton = [[UIButton alloc] init];
        [_continueButton setTranslatesAutoresizingMaskIntoConstraints:NO];
        [_continueButton setTitle:@"계속" forState:UIControlStateNormal];
        [_continueButton setTitleColor:[UIColor whiteColor] forState:UIControlStateNormal];
        [_continueButton setTitleColor:[UIColor grayColor] forState:UIControlStateDisabled];
        [_continueButton setBackgroundColor:[UIColor colorWithRed:0.75 green:0.75 blue:0.75 alpha:1.0]];
        [_continueButton addTarget:self action:@selector(continueEditing:) forControlEvents:UIControlEventTouchUpInside];
        [_continueButton setEnabled:NO];
    }
    return _continueButton;
}

- (UILabel *)infoLabel {
    if (!_infoLabel) {
        _infoLabel = [[UILabel alloc] init];
        [_infoLabel setText:@"설정된 로그인 패턴을\n그려 주세요."];
        [_infoLabel setTranslatesAutoresizingMaskIntoConstraints:NO];
        [_infoLabel setTextAlignment:NSTextAlignmentCenter];
        [_infoLabel setTextColor:[UIColor blackColor]];
        [_infoLabel setLineBreakMode:NSLineBreakByWordWrapping];
        [_infoLabel setNumberOfLines:2];
    }
    return _infoLabel;
}

//- (UIImageView *)titleBackgroundImg {
//    if (!_titleBackgroundImg) {
//        UIImage *image = [UIImage imageNamed:@"pattern_title_bg"];
//
//        float resizeWidth = 375.0;
//        float resizeHeight = 50.0;
//
//        UIGraphicsBeginImageContext(CGSizeMake(resizeWidth, resizeHeight));
//        CGContextRef context = UIGraphicsGetCurrentContext();
//        CGContextTranslateCTM(context, 0.0, resizeHeight);
//        CGContextScaleCTM(context, 1.0, -1.0);
//
//        CGContextDrawImage(context, CGRectMake(0.0, 0.0, resizeWidth, resizeHeight), [image CGImage]);
//        UIImage *newImage = UIGraphicsGetImageFromCurrentImageContext();
//        UIGraphicsEndImageContext();
//
//        _titleBackgroundImg = [[UIImageView alloc] init];
//        [_titleBackgroundImg setTranslatesAutoresizingMaskIntoConstraints:NO];
//        [_titleBackgroundImg setImage:newImage];
//        [_titleBackgroundImg setContentMode:UIViewContentModeScaleAspectFit];
//        [_titleBackgroundImg setClipsToBounds:YES];
//    }
//    return _titleBackgroundImg;
//}

- (UIView *)titleBackgroundView {
    if (!_titleBackgroundView) {
        _titleBackgroundView = [[UIView alloc] init];
        [_titleBackgroundView setBackgroundColor:[UIColor colorWithHex:@"#2288e5"]];
        [_titleBackgroundView setFrame:CGRectMake(0.0f, 20.0f, 375.0f, 50.0f)];
    }
    return _titleBackgroundView;
}

- (UILabel *)titleLabel {
    if (!_titleLabel) {
        _titleLabel = [[UILabel alloc] init];
        [_titleLabel setText:@"패턴 인증"];
        [_titleLabel setTranslatesAutoresizingMaskIntoConstraints:NO];
        [_titleLabel setTextAlignment:NSTextAlignmentCenter];
        [_titleLabel setTextColor:[UIColor whiteColor]];
        [_titleLabel setFont:[UIFont boldSystemFontOfSize:20]];
        
    }
    return _titleLabel;
}

- (UIImageView *)patternStepImg {
    if (!_patternStepImg) {
        UIImage *image = [UIImage imageNamed:PGResource(@"pattern_step_bg.png")];
        
        float resizeWidth = 255.0;
        float resizeHeight = 31.0;
        
        UIGraphicsBeginImageContext(CGSizeMake(resizeWidth, resizeHeight));
        CGContextRef context = UIGraphicsGetCurrentContext();
        CGContextTranslateCTM(context, 0.0, resizeHeight);
        CGContextScaleCTM(context, 1.0, -1.0);
        
        CGContextDrawImage(context, CGRectMake(0.0, 0.0, resizeWidth, resizeHeight), [image CGImage]);
        UIImage *newImage = UIGraphicsGetImageFromCurrentImageContext();
        UIGraphicsEndImageContext();
        
        _patternStepImg = [[UIImageView alloc] init];
        [_patternStepImg setTranslatesAutoresizingMaskIntoConstraints:NO];
        [_patternStepImg setImage:newImage];
    }
    return _patternStepImg;
}

- (UIButton *)backButton {
    if (!_backButton) {
        UIImage *image = [UIImage imageNamed:PGResource(@"ico_prev.png")];
        float resizeWidth = 15.0;
        float resizeHeight = 25.0;
        
        UIGraphicsBeginImageContext(CGSizeMake(resizeWidth, resizeHeight));
        CGContextRef context = UIGraphicsGetCurrentContext();
        CGContextTranslateCTM(context, 0.0, resizeHeight);
        CGContextScaleCTM(context, 1.0, -1.0);
        
        CGContextDrawImage(context, CGRectMake(0.0, 0.0, resizeWidth, resizeHeight), [image CGImage]);
        UIImage *newImage = UIGraphicsGetImageFromCurrentImageContext();
        UIGraphicsEndImageContext();
        
        _backButton = [[UIButton alloc] init];
        [_backButton setTranslatesAutoresizingMaskIntoConstraints:NO];
        [_backButton setBackgroundImage:newImage forState:UIControlStateNormal];
        [_backButton setBackgroundImage:newImage forState:UIControlStateDisabled];
        [_backButton setTitle:@"이전" forState:UIControlStateNormal];
        [_backButton.titleLabel setFont:[UIFont systemFontOfSize:10.f]];
        [_backButton setTitleColor:[UIColor whiteColor] forState:UIControlStateNormal];
        [_backButton setTitleColor:[UIColor whiteColor] forState:UIControlStateDisabled];
        [_backButton setTitleEdgeInsets:UIEdgeInsetsMake(0.f, 0.f, -45.f, -5.f)];
        [_backButton addTarget:self action:@selector(cancelModification:) forControlEvents:UIControlEventTouchUpInside];
    }
    return _backButton;
}

#pragma mark IBActions

- (IBAction)confirmPattern:(id)sender {
    [self updatePatternViewForModificationIsVerified:YES];
}

- (IBAction)cancelModification:(id)sender {
    [[PatternManager sharedManager] deletePattern];
    [self.delegate cancelEditing];
    [self dismissViewControllerAnimated:YES completion:nil];
//    [self.view removeFromSuperview];
}

- (IBAction)resetPattern:(id)sender {
    [self.patternView invalidateCurrentPattern];
    self.infoLabel.text = @"패턴을 설정해 주세요.";
}

- (IBAction)continueEditing:(id)sender {
    [self.patternView updateViewForReEntry];
    self.patternState = PatternStateReEntry;
}

#pragma mark Pattern Validation
- (BOOL)isPatternCorrect:(NSArray *)pattern {
    if (self.patternState == PatternStateValidation) {
        return [[PatternManager sharedManager] isCorrectPattern:pattern];
    } else if (self.patternState == PatternStateReEntry) {
        return [[PatternManager sharedManager] pattern:pattern isEqualToPattern:self.tempPattern];
    }
    return YES;
}

- (BOOL)isPatternValid:(NSArray *)pattern {
    return [pattern count] >= 5;
}

#pragma mark Pattern Delegate
- (void)enteredPattern:(NSArray *)pattern {
    if (self.patternState == PatternStateEntry) {
        if ([self isPatternValid:pattern]) {
            self.tempPattern = [pattern copy];
            [self.resetButton setEnabled:YES];
            [self.continueButton setEnabled:YES];
            self.infoLabel.text = @"패턴을 저장하였습니다.";
        } else {
            [self showInvalidPatternAlert];
            [self.patternView updateViewForReEntry];
        }
    } else {
        if ([self isPatternCorrect:pattern]) {
            if (self.patternMode == PatternModeValidation) {
                [self.patternView updateViewForCorrectPatternAnimates:YES];
            } else if (self.patternMode == PatternModeModify && self.patternState == PatternStateValidation) {
                self.patternState = PatternStateEntry;
                [self updatePatternViewForModificationIsVerified:YES];
            } else if (self.patternState == PatternStateReEntry) {
                [self.confirmButton setEnabled:YES];
                self.infoLabel.text = @"아래와 같은 잠금해제 패턴을 설정하였습니다.";
            }
        } else {
            if (self.patternMode == PatternModeValidation) {
                self.patternFailCount++;
                if (self.patternFailCount < 5) {
                    self.infoLabel.text = [NSString stringWithFormat:@"잠금해제 패턴 %ld회 오류입니다.\n총 5회 이상 오류시 재설정후 사용바랍니다.", self.patternFailCount];
                } else {
                    [[PatternManager sharedManager] deletePattern];
                    [self.delegate failedPattern];
                    //[self.view removeFromSuperview];
                    [self dismissViewControllerAnimated:YES completion:nil];
                }
            } else {
                if (self.patternState == PatternStateReEntry) {
                    self.infoLabel.text = @"잘못된 패턴 입니다. 다시 시도해 주세요.";
                }
            }
            [self.patternView updateViewForInCorrectPattern];
        }
    }
}

#pragma mark update Pattern View
- (void)updateViewForCorrectPattern {
    switch (self.patternMode) {
        case PatternModeValidation:
            [self.patternView updateViewForCorrectPatternAnimates:YES];
            break;
        case PatternModeModify:
            [self.patternView updateViewForInCorrectPattern];
            break;
        default:
            break;
    }
}

- (void)updatePatternViewForModificationIsVerified:(BOOL)verified {
    
    if (verified) {
        [self.patternView updateViewForCorrectPatternAnimates:NO];
        if (self.patternMode == PatternModeValidation) {
            [self.patternView updateViewForCorrectPatternAnimates:YES];
        } else {
            if (self.patternState == PatternStateReEntry) {
                [self updateStoredPattern];
                [self.delegate modifiedPattern];
                //[self.view removeFromSuperview];
                [self dismissViewControllerAnimated:YES completion:nil];
            }
        }
    } else {
        [self updatePatternViewForModificationIsVerified:NO];
    }
}

- (void)updateStoredPattern {
    [[PatternManager sharedManager] updatePattern:self.tempPattern];
}

- (void)showInvalidPatternAlert {
    [self.infoLabel setText:@"패턴이 너무 단순합니다.\n다시 시도해 주세요."];
}

- (void)updateUIForPatternEntry {
    
}

#pragma mark Pattern View Delegate
- (void)completedAnimations {
    [self.delegate unlockedPattern];
    //[self.view removeFromSuperview];
    [self dismissViewControllerAnimated:YES completion:nil];
}

- (void)startedDrawing {
    if (self.patternState == PatternStateEntry || self.patternState == PatternStateReEntry) {
        [self.infoLabel setText:@"패턴 입력이 완료되면 손가락을 떼세요."];
    }
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

@end
