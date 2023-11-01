FasdUAS 1.101.10   ��   ��    k             x     �� ����    4    �� 
�� 
frmk  m     	 	 � 
 
  S o u n d A n a l y s i s��        l     ��������  ��  ��        l          j    �� �� *0 confidencethreshold confidenceThreshold  m       ?�333333  K E Level of confidence necessary for classification to appear in result     �   �   L e v e l   o f   c o n f i d e n c e   n e c e s s a r y   f o r   c l a s s i f i c a t i o n   t o   a p p e a r   i n   r e s u l t      l          j    �� �� 0 	theresult 	theResult  m       �      S M Sequence of sound classification labels throughout the sound file's duration     �   �   S e q u e n c e   o f   s o u n d   c l a s s i f i c a t i o n   l a b e l s   t h r o u g h o u t   t h e   s o u n d   f i l e ' s   d u r a t i o n      l     ��������  ��  ��       !   l     �� " #��   " 1 + Analyze sound file for classifiable sounds    # � $ $ V   A n a l y z e   s o u n d   f i l e   f o r   c l a s s i f i a b l e   s o u n d s !  % & % i     ' ( ' I      �� )���� 0 analyzesound analyzeSound )  *�� * o      ���� 0 filepath filePath��  ��   ( k     Q + +  , - , p       . . ������ 0 	theresult 	theResult��   -  / 0 / l     ��������  ��  ��   0  1 2 1 l     �� 3 4��   3 * $ Initialize sound analyzer with file    4 � 5 5 H   I n i t i a l i z e   s o u n d   a n a l y z e r   w i t h   f i l e 2  6 7 6 r     
 8 9 8 n     : ; : I    �� <���� $0 fileurlwithpath_ fileURLWithPath_ <  =�� = o    ���� 0 filepath filePath��  ��   ; n     > ? > o    ���� 0 nsurl NSURL ? m     ��
�� misccura 9 o      ���� 0 theurl theURL 7  @ A @ r     B C B n    D E D I    �� F���� (0 initwithurl_error_ initWithURL_error_ F  G H G o    ���� 0 theurl theURL H  I�� I l    J���� J m    ��
�� 
msng��  ��  ��  ��   E n    K L K I    �������� 	0 alloc  ��  ��   L n    M N M o    ���� *0 snaudiofileanalyzer SNAudioFileAnalyzer N m    ��
�� misccura C o      ���� 0 theanalyzer theAnalyzer A  O P O l   ��������  ��  ��   P  Q R Q l   �� S T��   S F @ Initial sound classification request and add it to the analyzer    T � U U �   I n i t i a l   s o u n d   c l a s s i f i c a t i o n   r e q u e s t   a n d   a d d   i t   t o   t h e   a n a l y z e r R  V W V r    , X Y X n   * Z [ Z I   " *�� \���� J0 #initwithclassifieridentifier_error_ #initWithClassifierIdentifier_error_ \  ] ^ ] l  " % _���� _ n  " % ` a ` o   # %���� @0 snclassifieridentifierversion1 SNClassifierIdentifierVersion1 a m   " #��
�� misccura��  ��   ^  b�� b l  % & c���� c m   % &��
�� 
msng��  ��  ��  ��   [ n   " d e d I    "�������� 	0 alloc  ��  ��   e n    f g f o    ���� 00 snclassifysoundrequest SNClassifySoundRequest g m    ��
�� misccura Y o      ���� 0 
therequest 
theRequest W  h i h n  - 5 j k j I   . 5�� l���� @0 addrequest_withobserver_error_ addRequest_withObserver_error_ l  m n m l  . / o���� o o   . /���� 0 
therequest 
theRequest��  ��   n  p q p l  / 0 r���� r  f   / 0��  ��   q  s�� s l  0 1 t���� t m   0 1��
�� 
msng��  ��  ��  ��   k o   - .���� 0 theanalyzer theAnalyzer i  u v u l  6 6��������  ��  ��   v  w x w l  6 6�� y z��   y 5 / Start the analysis and wait for it to complete    z � { { ^   S t a r t   t h e   a n a l y s i s   a n d   w a i t   f o r   i t   t o   c o m p l e t e x  | } | n  6 ; ~  ~ I   7 ;�������� 0 analyze  ��  ��    o   6 7���� 0 theanalyzer theAnalyzer }  � � � V   < N � � � I  D I�� ���
�� .sysodelanull��� ��� nmbr � m   D E � � ?���������   � =  @ C � � � o   @ A���� 0 	theresult 	theResult � m   A B � � � � �   �  ��� � L   O Q � � o   O P���� 0 	theresult 	theResult��   &  � � � l     ��������  ��  ��   �  � � � l     �� � ���   � #  Act on classification result    � � � � :   A c t   o n   c l a s s i f i c a t i o n   r e s u l t �  � � � i     � � � I      �� ����� 60 request_didproduceresult_ request_didProduceResult_ �  � � � o      ���� 0 request   �  ��� � o      ���� 
0 result  ��  ��   � k     O � �  � � � p       � � ������ *0 confidencethreshold confidenceThreshold��   �  � � � p       � � ������ 0 	theresult 	theResult��   �  � � � l     ��������  ��  ��   �  � � � l     �� � ���   � E ? Add classification labels whose confidence meets the threshold    � � � � ~   A d d   c l a s s i f i c a t i o n   l a b e l s   w h o s e   c o n f i d e n c e   m e e t s   t h e   t h r e s h o l d �  � � � r      � � � n     � � � I    �������� 0 classifications  ��  ��   � o     ���� 
0 result   � o      ���� (0 theclassifications theClassifications �  � � � r     � � � m    	����  � o      ���� 0 i   �  ��� � V    O � � � k   " J � �  � � � r   " ( � � � n   " & � � � 4   # &�� �
�� 
cobj � o   $ %���� 0 i   � o   " #���� (0 theclassifications theClassifications � o      ���� 0 classification   �  � � � Z   ) D � ����� � ?   ) 0 � � � n  ) . � � � I   * .�������� 0 
confidence  ��  ��   � o   ) *���� 0 classification   � o   . /���� *0 confidencethreshold confidenceThreshold � r   3 @ � � � b   3 > � � � b   3 < � � � o   3 4���� 0 	theresult 	theResult � l  4 ; ����� � c   4 ; � � � n  4 9 � � � I   5 9����~�� 0 
identifier  �  �~   � o   4 5�}�} 0 classification   � m   9 :�|
�| 
ctxt��  ��   � m   < = � � � � �    � o      �{�{ 0 	theresult 	theResult��  ��   �  ��z � r   E J � � � [   E H � � � o   E F�y�y 0 i   � m   F G�x�x  � o      �w�w 0 i  �z   � F    ! � � � A     � � � n     � � � 1    �v
�v 
leng � o    �u�u 0 	theresult 	theResult � m    �t�t� � A     � � � o    �s�s 0 i   � l    ��r�q � I   �p ��o
�p .corecnte****       **** � o    �n�n (0 theclassifications theClassifications�o  �r  �q  ��   �  � � � l     �m�l�k�m  �l  �k   �  � � � l     �j � ��j   � ? 9 Set the result if an error occurs to avoid infinite loop    � � � � r   S e t   t h e   r e s u l t   i f   a n   e r r o r   o c c u r s   t o   a v o i d   i n f i n i t e   l o o p �  � � � i     � � � I      �i ��h�i 60 request_didfailwitherror_ request_didFailWithError_ �  � � � o      �g�g 0 request   �  ��f � o      �e�e 	0 error  �f  �h   � k      � �  � � � p       � � �d�c�d 0 	theresult 	theResult�c   �  ��b � Z      � ��a�` � =     � � � o     �_�_ 0 	theresult 	theResult � m     � � � � �   � r    	 � � � m     � � � � �    � o      �^�^ 0 	theresult 	theResult�a  �`  �b   �    l     �]�\�[�]  �\  �[    l     �Z�Z   d ^ Set the result if request completes without classifications being made to avoid infinite loop    � �   S e t   t h e   r e s u l t   i f   r e q u e s t   c o m p l e t e s   w i t h o u t   c l a s s i f i c a t i o n s   b e i n g   m a d e   t o   a v o i d   i n f i n i t e   l o o p  i     	
	 I      �Y�X�Y *0 requestdidcomplete_ requestDidComplete_ �W o      �V�V 0 request  �W  �X  
 k       p       �U�T�U 0 	theresult 	theResult�T   �S Z     �R�Q =     o     �P�P 0 	theresult 	theResult m     �   r    	 m     �    o      �O�O 0 	theresult 	theResult�R  �Q  �S    l     �N�M�L�N  �M  �L   �K i   ! $  I     �J!�I
�J .aevtoappnull  �   � ****! l     "�H�G" o      �F�F 0 argv  �H  �G  �I    L     
## I     	�E$�D�E 0 analyzesound analyzeSound$ %�C% n    &'& 4    �B(
�B 
cobj( m    �A�A ' o    �@�@ 0 argv  �C  �D  �K       
�?)*  +,-./�?  ) �>�=�<�;�:�9�8�7
�> 
pimr�= *0 confidencethreshold confidenceThreshold�< 0 	theresult 	theResult�; 0 analyzesound analyzeSound�: 60 request_didproduceresult_ request_didProduceResult_�9 60 request_didfailwitherror_ request_didFailWithError_�8 *0 requestdidcomplete_ requestDidComplete_
�7 .aevtoappnull  �   � ***** �60�6 0  11 �52�4
�5 
cobj2 33   �3 	
�3 
frmk�4  + �2 (�1�045�/�2 0 analyzesound analyzeSound�1 �.6�. 6  �-�- 0 filepath filePath�0  4 �,�+�*�)�, 0 filepath filePath�+ 0 theurl theURL�* 0 theanalyzer theAnalyzer�) 0 
therequest 
theRequest5 �(�'�&�%�$�#�"�!� ���� � ��
�( misccura�' 0 nsurl NSURL�& $0 fileurlwithpath_ fileURLWithPath_�% *0 snaudiofileanalyzer SNAudioFileAnalyzer�$ 	0 alloc  
�# 
msng�" (0 initwithurl_error_ initWithURL_error_�! 00 snclassifysoundrequest SNClassifySoundRequest�  @0 snclassifieridentifierversion1 SNClassifierIdentifierVersion1� J0 #initwithclassifieridentifier_error_ #initWithClassifierIdentifier_error_� @0 addrequest_withobserver_error_ addRequest_withObserver_error_� 0 analyze  � 0 	theresult 	theResult
� .sysodelanull��� ��� nmbr�/ R��,�k+ E�O��,j+ ��l+ E�O��,j+ ��,�l+ 	E�O��)�m+ 
O�j+ O h�� �j [OY��O�, � ���78�� 60 request_didproduceresult_ request_didProduceResult_� �9� 9  ��� 0 request  � 
0 result  �  7 ������ 0 request  � 
0 result  � (0 theclassifications theClassifications� 0 i  � 0 classification  8 �����
�	����� �� 0 classifications  � 0 	theresult 	theResult
� 
leng��
�
 .corecnte****       ****
�	 
bool
� 
cobj� 0 
confidence  � *0 confidencethreshold confidenceThreshold� 0 
identifier  
� 
ctxt� P�j+  E�OkE�O Bh��,�	 ��j �&��/E�O�j+ � ��j+ 	�&%�%E�Y hO�kE�[OY��- � ���:;� � 60 request_didfailwitherror_ request_didFailWithError_� ��<�� <  ������ 0 request  �� 	0 error  �  : ������ 0 request  �� 	0 error  ; �� � ��� 0 	theresult 	theResult�  ��  �E�Y h. ��
����=>���� *0 requestdidcomplete_ requestDidComplete_�� ��?�� ?  ���� 0 request  ��  = ���� 0 request  > ���� 0 	theresult 	theResult�� ��  �E�Y h/ �� ����@A��
�� .aevtoappnull  �   � ****�� 0 argv  ��  @ ���� 0 argv  A ����
�� 
cobj�� 0 analyzesound analyzeSound�� *��m/k+  ascr  ��ޭ