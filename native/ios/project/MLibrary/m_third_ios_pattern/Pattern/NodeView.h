//
//  NodeView.h
//  MOBILE_KOREA_MAIL.iOS
//
//  Created by kang on 2017. 9. 14..
//
//

#import <UIKit/UIKit.h>

@interface NodeView : UIView

- (instancetype)initWithWidth:(CGFloat)width;
- (void)markInvalid;
- (void)reset;
- (void)animateNode;

@end

