# QSenseR

In the current Qlik Sense solution, there is a Qlik Sense table object where the user can choose to [de]select specific rows, which are set by 1 dimension and 1 measure in the properties, then by clicking a Submit button, the two columns’ rows are sent to the middleware service powered by Node.js. The data is received as JSON and gets transformed into a vectorized format, which is in turn passed to RServe via a node.js NPM package called “node-rio”. RIO calls an R package/script to run against the R instance. The R script returns the value of the function (in this case a simple standard deviation) back to Node.js/RIO and finally that result is passed back to the extension. 
Here’s what the simple extension looks like in action. In this case the eCodeKey values get sent to R as one vector and the eCodeValue values get sent as another vector. R does a standard deviation on all of the eCodeValue values and returns the results in JSON format to Node.js/RIO and Node.js then passes the results back to the extension. 

This solution is more extensible in general and is easily understandable to a programmer. It requires a bit more programming on the middleware side for different use cases but once the concepts are grasped by an internal developer, the power of the middleware can now be employed to many different use cases in the organization.
This extension can be easily ported to QlikView.

How to install/run the implementation:

1.	R

  a.	Download and Install open source R 
  
  b.	Inside of R Studio, run the following:
  
       i.	Install.packages(“Rserve”) (just the first time)
    
       ii.	 library(Rserve)
    
       iii.	Rserve()
    
2.	Node: 

  a.	Install Node.js from here: 
  
      http://nodejs.org/download/
      
  b.	Change the path to the appropriate directory in qlikR.R (this is for the data export to .Rda file)
  
  c.	Once Node.js is installed, extract the node portion folder into a working directory
  
  d.	Open a command prompt and enter the directory
  
  e.	Type “node qlikRnode.js” and hit enter
  
  i.	There should be no errors, if there are, diagnose and fix
  
3.	Qlik Sense:

  a.	Extract the extension folder into <home directory>\Qlik\Sense\Extensions
  
  b.	Start Qlik Sense
  
  c.	For best practice with debugging, access the application/hub using the web browser with http://localhost:4848/hub
  
  d.	Optional – drop the example “nvtcodetest.qvf” Qlik Sense app into <home directory>\Qlik\Sense\Apps
