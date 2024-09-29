//
//  DrawingView.h
//  MOBILE_KOREA_MAIL.iOS
//
//  Created by kang on 2017. 9. 14..
//
//

#import <UIKit/UIKit.h>

@interface DrawingView : UIView

- (instancetype)initWithPoints:(NSArray *)points;
- (void)updatePointsWithArray:(NSArray *)newPoints;
- (void)markInvalid;
- (void)reset;

@end
