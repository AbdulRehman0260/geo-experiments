from sklearn.linear_model import Ridge
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from scipy import stats

__all__ = ["GeoSelector", "GeoTest"]

class GeoSelector:
    def __init__(self,df:pd.DataFrame,metric,geo_column):
        self.df = df
        self.metric = metric
        self.geo_column = geo_column
        self.geos = df[self.geo_column].unique().tolist()
        self.results = {}
    
    def divide_data(self,test_geo):
        pivot = self.df.pivot(index="date", columns=self.geo_column, values=self.metric)
        y = pivot[test_geo]
        X = pivot.drop(columns=[test_geo])
        pre_period_x = X.iloc[X.shape[0]-180:X.shape[0]-60]
        post_period_x = X.iloc[X.shape[0]-60:X.shape[0]]
        pre_period_y = y.iloc[y.shape[0]-180:y.shape[0]-60]
        post_period_y = y.iloc[y.shape[0]-60:y.shape[0]]
        return (pre_period_x,post_period_x,pre_period_y,post_period_y)

    def model(self,test_geo):
        pre_period_x,post_period_x,pre_period_y,post_period_y = self.divide_data(test_geo)
        model = Ridge(alpha=1.0)
        model.fit(pre_period_x, pre_period_y)
        y_pred_pre = model.predict(pre_period_x)
        y_pred_post = model.predict(post_period_x)
        return (y_pred_pre,pre_period_y,y_pred_post,post_period_y)

    def error_estimation(self,test_geo):
        y_pred_pre,pre_period_y,y_pred_post,post_period_y = self.model(test_geo)
        rmse_pre = np.sqrt(np.mean((pre_period_y - y_pred_pre) ** 2))
        rmse_post = np.sqrt(np.mean((post_period_y - y_pred_post) ** 2))
        nrmse_pre = rmse_pre / pre_period_y.mean()
        nrmse_post = rmse_post / post_period_y.mean()
        return (nrmse_pre,nrmse_post)
    
    def calculate_all_results(self):
        """Calculate error metrics for all geographies"""
        for test_geo in self.geos:
            nrmse_pre, nrmse_post = self.error_estimation(test_geo)
            self.results[test_geo] = {
                'nrmse_pre': nrmse_pre,
                'nrmse_post': nrmse_post
            }
        return pd.DataFrame.from_dict(self.results, orient='index')


class GeoTest:
    def __init__(self,df:pd.DataFrame,metric,geo_column,geo):
        self.df = df
        self.geo = geo
        self.metric = metric
        self.geo_column = geo_column
    
    def divide_data(self,geo):
        pivot = self.df.pivot(index="date", columns=self.geo_column, values=self.metric)
        y = pivot[geo]
        X = pivot.drop(columns=[geo])
        pre_period_x = X.iloc[X.shape[0]-180:X.shape[0]-60]
        post_period_x = X.iloc[X.shape[0]-60:X.shape[0]]
        pre_period_y = y.iloc[y.shape[0]-180:y.shape[0]-60]
        post_period_y = y.iloc[y.shape[0]-60:y.shape[0]]
        return (pre_period_x,post_period_x,pre_period_y,post_period_y)

    def model(self,geo):
        pre_period_x,post_period_x,pre_period_y,post_period_y = self.divide_data(geo)
        model = Ridge(alpha=1.0)
        model.fit(pre_period_x, pre_period_y)
        y_pred_pre = model.predict(pre_period_x)
        y_pred_post = model.predict(post_period_x)
        return (y_pred_pre,pre_period_y,y_pred_post,post_period_y)

    def error_estimation(self,geo):
        y_pred_pre,pre_period_y,y_pred_post,post_period_y = self.model(geo)
        rmse_pre = np.sqrt(np.mean((pre_period_y - y_pred_pre) ** 2))
        rmse_post = np.sqrt(np.mean((post_period_y - y_pred_post) ** 2))
        nrmse_pre = rmse_pre / pre_period_y.mean()
        nrmse_post = rmse_post / post_period_y.mean()
        return (nrmse_pre,nrmse_post)
    
    def calculate_power(self, effect_sizes=[0.05, 0.10, 0.15, 0.20], power_levels=[0.80, 0.90], max_days=60):
        """
        Calculate days needed for different effect sizes and power levels
        
        Returns: DataFrame with effect_size, power_level, days_needed
        """
        pre_period_x, post_period_x, pre_period_y, post_period_y = self.divide_data(self.geo)
        
        # Train model
        model = Ridge(alpha=1.0)
        model.fit(pre_period_x, pre_period_y)
        y_pred_post = model.predict(post_period_x)
        
        # Calculate baseline variance
        variance = np.var(post_period_y - y_pred_post)
        mean_val = np.mean(post_period_y)
        
        results = []
        
        for effect_size in effect_sizes:
            for power_level in power_levels:
                # Z-scores for different power levels
                z_scores = {0.80: 2.8, 0.90: 3.3, 0.95: 3.9}
                z_score = z_scores.get(power_level, 2.8)
                
                # Calculate days needed
                days_needed = int((z_score * np.sqrt(variance) / (effect_size * mean_val))**2)
                days_needed = min(days_needed, max_days)
                
                results.append({
                    'effect_size': effect_size,
                    'power_level': power_level,
                    'days_needed': days_needed
                })
        
        return pd.DataFrame(results)
    
    def simulate_effect(self, effect_size=0.10, show_plot=True):
        """
        Simulate an effect in the post period and test if mean analysis detects it
        
        Parameters:
        - effect_size: The effect size to simulate (e.g., 0.10 for 10% increase)
        - show_plot: Whether to display the plot
        
        Returns: Dictionary with detection results
        """
        # Get original data
        y_pred_pre, pre_period_y, y_pred_post, post_period_y = self.model(self.geo)
        
        # Calculate original lift (before adding effect)
        original_lift = post_period_y - y_pred_post
        original_mean_lift = np.mean(original_lift)
        
        # Simulate effect: add effect_size to post period
        simulated_post = post_period_y * (1 + effect_size)
        
        # Calculate new lift (after adding effect)
        new_lift = simulated_post - y_pred_post
        new_mean_lift = np.mean(new_lift)
        
        # The actual effect lift is the difference between new and original lifts
        actual_effect_lift = new_mean_lift - original_mean_lift
        expected_effect_lift = effect_size * np.mean(post_period_y)
        
        # Statistical test - t-test on the new lift
        n = len(new_lift)
        std_error = np.std(new_lift) / np.sqrt(n)
        t_stat = new_mean_lift / std_error
        p_value = 2 * (1 - stats.t.cdf(abs(t_stat), n - 1))
        
        # Determine if effect is detected
        detected = p_value < 0.05
        
        if show_plot:
            dates = self.df['date'].unique()[-180:]
            pre_dates = dates[:-60]
            post_dates = dates[-60:]
            
            plt.figure(figsize=(12, 6))
            
            # Plot original data
            plt.plot(pre_dates, pre_period_y, 'b-', label='Actual (Pre)', linewidth=2)
            plt.plot(pre_dates, y_pred_pre, 'b--', label='Synthetic (Pre)', linewidth=2)
            plt.plot(post_dates, post_period_y, 'r-', label='Actual (Post - Original)', linewidth=2, alpha=0.5)
            plt.plot(post_dates, y_pred_post, 'r--', label='Synthetic (Post)', linewidth=2)
            
            # Plot simulated effect
            plt.plot(post_dates, simulated_post, 'g-', label=f'Actual (Post + {effect_size*100:.0f}% Effect)', linewidth=3)
            
            plt.axvline(x=post_dates[0], color='gray', linestyle=':', label='Treatment Start')
            plt.title(f'Effect Simulation - {self.geo} ({effect_size*100:.0f}% Effect)')
            plt.ylabel(self.metric.capitalize())
            plt.legend()
            plt.grid(True, alpha=0.3)
            plt.xticks(rotation=45)
            plt.tight_layout()
            plt.show()
        
        return {
            'effect_size': effect_size,
            'original_mean_lift': original_mean_lift,
            'new_mean_lift': new_mean_lift,
            'actual_effect_lift': actual_effect_lift,
            'expected_effect_lift': expected_effect_lift,
            'lift_percentage': (actual_effect_lift / np.mean(y_pred_post)) * 100,
            't_statistic': t_stat,
            'p_value': p_value,
            'detected': detected,
            'std_error': std_error
        }
    
    def plot_results(self):
        """Simple plot of synthetic control results"""
        y_pred_pre, pre_period_y, y_pred_post, post_period_y = self.model(self.geo)
        
        dates = self.df['date'].unique()[-180:]
        pre_dates = dates[:-60]
        post_dates = dates[-60:]
        
        plt.figure(figsize=(12, 6))
        plt.plot(pre_dates, pre_period_y, 'b-', label='Actual (Pre)', linewidth=2)
        plt.plot(pre_dates, y_pred_pre, 'b--', label='Synthetic (Pre)', linewidth=2)
        plt.plot(post_dates, post_period_y, 'r-', label='Actual (Post)', linewidth=2)
        plt.plot(post_dates, y_pred_post, 'r--', label='Synthetic (Post)', linewidth=2)
        
        plt.axvline(x=post_dates[0], color='gray', linestyle=':', label='Treatment Start')
        plt.title(f'Synthetic Control - {self.geo}')
        plt.ylabel(self.metric.capitalize())
        plt.legend()
        plt.grid(True, alpha=0.3)
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.show()
        
        # Calculate lift
        lift = np.mean(post_period_y - y_pred_post)
        lift_pct = (lift / np.mean(y_pred_post)) * 100
        
        return {'lift': lift, 'lift_percentage': lift_pct}


