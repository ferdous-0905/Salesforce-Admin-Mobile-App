package com.quiz.reminderdevice

import android.app.ActivityManager
import android.app.AlarmManager
import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/** Read platform restrictions; settings screens require an explicit learner action. */
class ReminderDeviceModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ReminderDevice")
    AsyncFunction("getStatus") {
      val context = appContext.reactContext ?: error("App context unavailable")
      val power = context.getSystemService(Context.POWER_SERVICE) as PowerManager
      val activity = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
      val alarms = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
      val notifications = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
      mapOf(
        "batteryOptimizationEnabled" to !power.isIgnoringBatteryOptimizations(context.packageName),
        "batterySaver" to power.isPowerSaveMode,
        "backgroundRestricted" to (Build.VERSION.SDK_INT >= 28 && activity.isBackgroundRestricted),
        "exactAlarmsAllowed" to (Build.VERSION.SDK_INT < 31 || alarms.canScheduleExactAlarms()),
        "doNotDisturb" to (notifications.currentInterruptionFilter != NotificationManager.INTERRUPTION_FILTER_ALL && notifications.currentInterruptionFilter != NotificationManager.INTERRUPTION_FILTER_UNKNOWN)
      )
    }
    AsyncFunction("openSettings") { destination: String ->
      val context = appContext.reactContext ?: error("App context unavailable")
      val fallback = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:${context.packageName}"))
      val intent = when (destination) {
        "notifications" -> Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).putExtra(Settings.EXTRA_APP_PACKAGE, context.packageName)
        "channel" -> Intent(Settings.ACTION_CHANNEL_NOTIFICATION_SETTINGS)
          .putExtra(Settings.EXTRA_APP_PACKAGE, context.packageName)
          .putExtra(Settings.EXTRA_CHANNEL_ID, "learning-reminders")
        "optimization" -> Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS)
        "battery" -> fallback
        else -> error("Unknown settings destination")
      }
      try {
        context.startActivity(intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
      } catch (_: android.content.ActivityNotFoundException) {
        context.startActivity(fallback.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
      }
    }
  }
}
