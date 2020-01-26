# DotCHA: A 3D Text-based Scatter-type CAPTCHA
We introduce a new type of 3D text-based CAPTCHA, called DotCHA, which relies on human interaction. DotCHA asks users to rotate a 3D text model to identify the correct letters. The 3D text model is a twisted form of sequential 3D letters around a center pivot axis, and it shows different letters depending on the rotation angle. The model is not composed of a solid letter model, but a number of spheres to resist character segmentation attacks, and this is why DotCHA is classified as a scatter-type CAPTCHA. Since each letter can only be identified in a particular direction, it makes DotCHA resistant to machine learning attacks. We demonstrate that DotCHA, while maintaining usability, is resistant to existing types of attacks.

## Authors
[Suzi Kim](https://www.kimsuzi.com/cv) and [Sunghee Choi](https://sites.google.com/view/kaist-gclab/members/professor)  
@ Geomtric Computing Lab., School of Computing, KAIST  
presented at [ICWE 2019](https://icwe2019.webengineering.org)
(_Distinguished Paper Award_)

## Citation
- Kim S., & Choi S. (2019) DotCHA: A 3D Text-Based Scatter-Type CAPTCHA. In: Bakaev M., Frasincar F., Ko IY. (eds) Web Engineering. ICWE 2019. Lecture Notes in Computer Science, vol 11496. Springer, Cham

```
@inproceedings{Kim2019DotCHA,
  author    = {Suzi Kim and
               Sunghee Choi},
  title     = {DotCHA: {A} 3D Text-Based Scatter-Type {CAPTCHA}},
  booktitle = {Web Engineering - 19th International Conference, {ICWE} 2019, Daejeon,
               South Korea, June 11-14, 2019, Proceedings},
  pages     = {238--252},
  year      = {2019},
  crossref  = {DBLP:conf/icwe/2019},
  url       = {https://doi.org/10.1007/978-3-030-19274-7\_18},
  doi       = {10.1007/978-3-030-19274-7\_18},
}
```

- Kim S., & Choi S. (2020) DotCHA: An Interactive 3D Text-based CAPTCHA. Journal of Web Engineering, 18(8), 837–864, doi:10.13052/jwe1540-9589.1884
```
@article{Kim2020DotCHA,
  author    = {Suzi Kim and
               Sunghee Choi},
  title     = {DotCHA: {An} Interactive 3D Text-based {CAPTCHA}},
  journal = {Journal of Web Engineering},
  year    = {2020},
  month   = jan,
  volume  = {18},
  number  = {8},
  pages   = {837--864},
  issn    = {1540-9589},
  url     = {https://doi.org/10.13052/jwe1540-9589.1884},
  doi     = {10.13052/jwe1540-9589.1884},
}
```

## Demo
http://suzikim.github.io/DotCHA

