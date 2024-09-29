//
//  NodeView.m
//  MOBILE_KOREA_MAIL.iOS
//
//  Created by kang on 2017. 9. 14..
//
//

#import "NodeView.h"
#import <MThirdPartyPattern/MThirdPartyPatternPlugin.h>

@interface NodeView ()
@property (nonatomic) CGFloat width;
@property (nonatomic, strong) UIColor *nodeColor;
@property (nonatomic) CGFloat maskInset;
@end

@implementation NodeView

- (instancetype)initWithWidth:(CGFloat)width {
    if (self = [super init]) {
        _width = width;
        UIImage *image = [UIImage imageNamed:PGResource(@"pattern_btn_normal.png")];
        UIColor *background = [[UIColor alloc] initWithPatternImage:image];
        _nodeColor = background;
        _maskInset = 5.0;
        [self setUpView];
    }
    return self;
}

//- (void)drawRect:(CGRect)rect {
//    [super drawRect:rect];
//    UIBezierPath *path = [UIBezierPath bezierPathWithOvalInRect:CGRectInset(rect, self.maskInset, self.maskInset)];
//    CAShapeLayer *shapeLayer = [[CAShapeLayer alloc] init];
//    shapeLayer.path = path.CGPath;
//    self.layer.mask = shapeLayer;
//}

- (void)setUpView {
    [self setTranslatesAutoresizingMaskIntoConstraints:NO];
    [self setBackgroundColor:self.nodeColor];
    [self addConstraint:[NSLayoutConstraint constraintWithItem:self
                                                     attribute:NSLayoutAttributeWidth
                                                     relatedBy:NSLayoutRelationEqual
                                                        toItem:nil
                                                     attribute:NSLayoutAttributeNotAnAttribute
                                                    multiplier:1
                                                      constant:self.width]];
    [self addConstraint:[NSLayoutConstraint constraintWithItem:self
                                                     attribute:NSLayoutAttributeHeight
                                                     relatedBy:NSLayoutRelationEqual
                                                        toItem:nil
                                                     attribute:NSLayoutAttributeNotAnAttribute
                                                    multiplier:1
                                                      constant:self.width]];
}

- (void)animateNode {
    UIImage *image = [UIImage imageNamed:PGResource(@"pattern_btn_error.png")];

    UIColor *background = [[UIColor alloc] initWithPatternImage:image];
    self.backgroundColor = background;
    self.maskInset = 0.0;
    [self setNeedsDisplay];
    [self performSelector:@selector(removeScaleEffect) withObject:self afterDelay:0.5];
}

- (void)removeScaleEffect {
    self.maskInset = 5.0;
    [self setNeedsDisplay];
}

- (void)markInvalid {
    UIImage *image = [UIImage imageNamed:PGResource(@"pattern_btn_error.png")];
    UIColor *background = [[UIColor alloc] initWithPatternImage:image];
    self.backgroundColor = background;
}

- (void)reset {
    UIImage *image = [UIImage imageNamed:PGResource(@"pattern_btn_normal.png")];
    UIColor *background = [[UIColor alloc] initWithPatternImage:image];
    self.backgroundColor = background;
}

@end
