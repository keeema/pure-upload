# CHANGELOG

## 8.1.5

Added options (capture) to removeEventListener so the matching events are added and removed

## 8.1.4

Added stop event propagation on drop if drop global action is not defined

## 8.1.3

Deny stop event propagation if drop global action is not defined

## 8.1.1 - 8.1.2

Remove overwriting external guid

## 8.1.0

Change dependencies

## 8.0.0

Fix audit findings in dependencies
Update TS@4.4.2

## 7.1.0

Fixed allowed files types for "_" and "_.\*".
Added validateMissingExtension check

## 7.0.0

Added onDragEnter and odDropGlobal callback functions

## 6.1.0

Added onDrag callback functions

## 6.0.0

Upgrade typescript@4.0.3.
IUploadFile.uploadStatus change to be optional.

## 5.6.0

Added Enumerator ErrorCode to IUploadFile

## 5.5.1

Fixed dependencies

## 5.5.0

Update to TS 3.8.3 and other dependencies fixed

## 5.4.0

Update to TS 3.7.2 and Gulp4 used

## 5.3.0

Enable event binding in capturing mode

## 5.2.0

Changed UploadArea to collect all files before firing onFileSelected and onFilesSelected.

## 5.1.0

Added files to start and clear for UploadArea.

## 5.0.6

Added onFilesSelected for UploadArea.

## 5.0.5

Updated build tools, changed minfied version.

## 5.0.4

Updated TS to 3.0.3.

## 5.0.3

Updated TS to 2.9.2.
FileInput made public for reading on Area.

## 5.0.2

Updated TS to 2.8.3.
Fixed potential vulnerability in devDependencies (hoex).
Fixed typos and lints.

## 5.0.1

Updated TS to 2.8.1.

## 5.0.0

Updated environment.
Updated TS to 2.7.2.
Higher restrictions.
Prettier.

## 4.2.1

Improved internal type definitions and casting

## 4.2.0

Added highlighting on dnd.

## 4.1.0

Added option to allow upload of empty files

## 4.0.1

## Fix

Options access modifier reverted to public.

## 4.0.0

## Changed localizations

Localizations are now accessible through new options property with specific errors.

## 3.0.0

## Cleaning

Removed compatibility parts for obsolette browser without FileAPI.

## 2.2.3

## Fix

Removed duplications when same file is adding many times to queue.
Few options of UploadArea changed to be acceptable as a function.

## 2.2.2

## Fix

Automatic clearing of manual upload file list after puting to queue is done on parameter.

## 2.2.0

## New features

Added manual triggering of adding file to UploadQueue in UploadArea.

## 2.1.0

## New features

Added offset for batches limited by max uploading file count.

## 2.0.5 - 2.0.8

Fixes

## 2.0.4

## Fixes

Modified update progress condition to not throw in IE.

## 2.0.3

## Fixes

Url is now loaded on file adding instead of request creating.

## 2.0.2

## New features

Added onFileCanceled for UploadArea
